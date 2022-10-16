import http from 'http';

import { express, redisConnection } from '@adarsh-mishra/node-utils';
import { ApolloServer } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import httpContext from 'express-http-context';

import { resolvers } from './resolvers';
import { typeDefs } from './schemas';
import { ServiceClients } from './services';
import { TGraphqlContext } from './types';

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

app.use(cors());
app.use(compression());
app.use(httpContext.middleware);

app.use((req, res, next) => {
	req.redisClient = redisClient;
	req.grpcServiceClients = ServiceClients;
	next();
});

const startApolloServer = async () => {
	const apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }): TGraphqlContext => {
			return {
				req,
				res,
				user: req.user,
				redisClient,
				grpcServiceClients: ServiceClients,
			};
		},
		debug: true,
		introspection: true,
	});
	await apolloServer.start();
	apolloServer.applyMiddleware({ app, bodyParserConfig: { limit: '50mb' } });
	return apolloServer;
};

const startHttpServer = async () => {
	const apolloServer = await startApolloServer();

	const httpServer = http.createServer(app);
	httpServer.timeout = 600000;

	httpServer.listen(port, () => {
		// eslint-disable-next-line no-console
		console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
	});
};

void startHttpServer();
