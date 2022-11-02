import { Server as SocketServer, Socket } from 'socket.io';

import { setUserOnlineStatusHelper, SocketKeys } from '../helpers/socketHelper';
import { TSocketData } from '../types';

export const OnSocketConnection = async (socket: Socket, io: SocketServer) => {
	await socket.join(SocketKeys.MY_ROOM(socket.data.userId));
	// eslint-disable-next-line no-console
	console.log('socket connected', socket.id, await io.fetchSockets());
	const { authClient, redisClient, userClient, userDetails } = socket.data as TSocketData;
	const { userId } = userDetails ?? {};
	if (!userId) {
		socket.disconnect(true);
		return;
	}

	socket.use((event, next) => {
		// eslint-disable-next-line no-console
		console.log('socket event =>>>>', event);
		next();
	});

	socket.on('disconnect', async () => {
		await socket.leave(SocketKeys.MY_ROOM(socket.data.userId));
		await setUserOnlineStatusHelper(redisClient!, userId, false, io);
		// eslint-disable-next-line no-console
		console.log('socket disconnected', socket.id, await io.fetchSockets());
	});
};
