import http from 'http';

import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { express, redisConnection } from '@adarsh-mishra/node-utils';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import httpContext from 'express-http-context';
import { subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { makeServer } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

import { getUserDetails, getUserTokenVerificationData } from './helpers';
import { validateAccess } from './middlewares/apiAuth';
import { schema } from './schemas';
import { ServiceClients } from './services';
import { PubSubEventsEnum, TGraphqlContext } from './types';

dotenv.config();

const isDevEnvironment = process.env.ENV === 'dev';

const redisClient = redisConnection({
	redisHost: isDevEnvironment ? process.env.DEV_REDIS_HOST : process.env.PROD_REDIS_HOST,
	redisPort: isDevEnvironment ? process.env.DEV_REDIS_PORT : process.env.PROD_REDIS_PORT,
	redisDB: isDevEnvironment ? process.env.DEV_REDIS_DB : process.env.PROD_REDIS_DB,
	options: {
		password: isDevEnvironment ? undefined : process.env.PROD_REDIS_PASSWORD,
		username: isDevEnvironment ? undefined : process.env.PROD_REDIS_USERNAME,
	},
});

const app = express();
const port = process.env.PORT || 3000;
const pubSub = new PubSub();

app.use(cors());
app.use(compression());
app.use(httpContext.middleware);
app.use(['/', '/graphql'], validateAccess);

app.use((req, res, next) => {
	req.redisClient = redisClient;
	req.grpcServiceClients = ServiceClients;
	next();
});

const startApolloServer = async () => {
	const httpServer = http.createServer(app);
	httpServer.timeout = 600000;

	const server = new WebSocketServer({
		server: httpServer,
		path: '/graphql/subscriptions',
	});

	const serverCleanup = useServer(
		{
			schema,
			connectionInitWaitTimeout: 0,
			context: async (ctx, msg, args) => {
				const connectionParams = ctx.connectionParams ?? {};
				const apiKey = connectionParams['api-key'];
				const authorization = connectionParams.Authorization;

				if ((!apiKey || apiKey === process.env.API_KEY) && !authorization) {
					return null;
				}
				const tokenVerificationResponse = getUserTokenVerificationData(authorization as string, false);
				const user = await getUserDetails(
					tokenVerificationResponse.userId,
					ServiceClients.user as UserServicesClient,
				);
				return {
					user,
					pubSub,
					redisClient,
					grpcServiceClients: ServiceClients,
				};
			},
			onConnect(ctx) {
				const connectionParams = ctx.connectionParams ?? {};
				const apiKey = connectionParams['api-key'];
				const authorization = connectionParams.Authorization;
				if ((!apiKey || apiKey === process.env.API_KEY) && !authorization) throw new Error('Unauthorized');
			},
		},
		server,
	);

	const apolloServer = new ApolloServer({
		schema,
		context: ({ req, res }): TGraphqlContext => {
			return {
				req,
				res,
				user: req.user,
				redisClient,
				grpcServiceClients: ServiceClients,
				pubSub,
			};
		},
		debug: true,
		introspection: true,
		plugins: [
			{
				async serverWillStart() {
					return {
						async drainServer() {
							httpServer.close();
						},
					};
				},
			},
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose();
						},
					};
				},
			},
		],
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({ app, bodyParserConfig: { limit: '50mb' } });
	httpServer.listen(port, () => {
		// eslint-disable-next-line no-console
		console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
	});
	return apolloServer;
};

void startApolloServer();
