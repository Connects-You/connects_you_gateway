import { express, upgradeResponse } from '@adarsh-mishra/node-utils/expressHelpers';
import { NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import { redisConnection } from '@adarsh-mishra/node-utils/redisHelpers';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';

import { SocketConfig } from './configs/socketConfigs';
import { SocketKeys } from './helpers/socketHelper';
import { validateAccess } from './middlewares/apiAuth';
import { socketAuthorization } from './middlewares/socketAuth';
import { router } from './routes';
import { ServiceClients } from './services';

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

const server = app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`🚀 Server ready at http://localhost:${port}`);
});

const io = new SocketServer(server, SocketConfig);

io.use((socket, next) => socketAuthorization(socket, next, redisClient));
io.on('connection', async (socket) => {
	await socket.join(SocketKeys.MY_ROOM(socket.data.userId));
	// eslint-disable-next-line no-console
	console.log('socket connected', socket.id, await io.fetchSockets());
});

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(validateAccess);

upgradeResponse(app).use(router);

app.use((req, res, next) => {
	req.redisClient = redisClient;
	req.grpcServiceClients = ServiceClients;
	req.socketIO = io;
	next();
});

app.all('*', (_, res) => {
	const error = new NotFoundError({ error: 'Bhand ho gye ho kya?' });
	res.status(error.statusCode).json(error);
});
