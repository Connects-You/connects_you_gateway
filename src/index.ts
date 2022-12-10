import { express, upgradeResponse } from '@adarsh-mishra/node-utils/expressHelpers';
import { NotFoundError } from '@adarsh-mishra/node-utils/httpResponses';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';

import { SocketConfig } from './configs/socketConfigs';
import { redisClient } from './helpers';
import { validateAccess } from './middlewares/apiAuth';
import { socketAuthorization } from './middlewares/socketAuth';
import { router } from './routes';
import { ServiceClients } from './services';
import { onChatSocketConnection } from './socket/chats';
import { onRoomSocketConnection } from './socket/rooms';
import { onUserSocketConnection } from './socket/users';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`🚀 Server ready at http://localhost:${port}`);
});

const io = new SocketServer(server, SocketConfig);

io.use((socket, next) => socketAuthorization(socket, next, redisClient));

io.of('/rooms').on('connection', async (socket) => {
	await onRoomSocketConnection(socket, io);
});

io.of('/chats').on('connection', async (socket) => {
	await onChatSocketConnection(socket, io);
});

io.of('/users').on('connection', async (socket) => {
	await onUserSocketConnection(socket, io);
});

app.use((req, res, next) => {
	// eslint-disable-next-line no-console
	console.log('method->>>', req.method, 'route->>>', req.path);
	next();
});

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(validateAccess);

app.use((req, res, next) => {
	req.redisClient = redisClient;
	req.grpcServiceClients = ServiceClients.getServiceClients();
	req.socketIO = io;
	next();
});

upgradeResponse(app).use(router);

app.all('*', (_, res) => {
	const error = new NotFoundError({ error: 'Bhand ho gye ho kya?' });
	res.status(error.statusCode).json(error);
});
