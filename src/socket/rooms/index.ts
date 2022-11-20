import { Server as SocketServer, Socket } from 'socket.io';

import { SocketEvents } from '../../events/socketEvents';
import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { TSocketData } from '../../types';

import { createGroupRoom } from './createGroupRoom';
import { findOrCreateDuetRoom } from './findOrCreateDuetRoom';
import { joinRoomIds } from './joinRoomIds';

export const onRoomSocketConnection = async (socket: Socket, io: SocketServer) => {
	await socket.join(SocketEvents.MY_ROOM(socket.data.userId));
	// eslint-disable-next-line no-console
	console.log('socket connected rooms', socket.id, await io.fetchSockets());
	const { redisClient, userDetails } = socket.data as TSocketData;
	const roomNamespace = io.of('/rooms');

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
		await socket.leave(SocketEvents.MY_ROOM(socket.data.userId));
		await setUserOnlineStatusHelper(redisClient!, userId, false, io);
		// eslint-disable-next-line no-console
		console.log('socket disconnected', socket.id, await io.fetchSockets());
	});

	socket.on('error', (error) => {
		// eslint-disable-next-line no-console
		console.log('socket error', error);
	});

	socket.on(SocketEvents.CREATE_DUET_ROOM, (body, callback) =>
		findOrCreateDuetRoom({ body, roomNamespace, socket, callback }),
	);
	socket.on(SocketEvents.CREATE_GROUP_ROOM, (body, callback) =>
		createGroupRoom({ body, roomNamespace, socket, callback }),
	);
	socket.on(SocketEvents.JOIN_ROOMS, (body, callback) => joinRoomIds({ body, socket, callback }));
};
