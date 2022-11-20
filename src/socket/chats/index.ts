import { Server as SocketServer, Socket } from 'socket.io';

import { SocketEvents } from '../../events/socketEvents';
import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { TSocketData } from '../../types';

import { deleteMessages } from './deleteMessages';
import { IAmTyping } from './IAmTyping';
import { messageSeen } from './messageSeen';
import { sendMessage } from './sendMessage';

export const onChatSocketConnection = async (socket: Socket, io: SocketServer) => {
	await socket.join(SocketEvents.MY_ROOM(socket.data.userId));
	// eslint-disable-next-line no-console
	console.log('socket connected chats', socket.id, await io.fetchSockets());
	const { redisClient, userDetails } = socket.data as TSocketData;

	// const chatsNamespace = io.of('/chats');

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

	socket.on(SocketEvents.SEND_MESSAGE, (body, callback) => sendMessage({ body, socket, callback }));
	socket.on(SocketEvents.MESSAGE_SEEN_BY_ME, (body, callback) => messageSeen({ body, socket, callback }));
	socket.on(SocketEvents.I_AM_TYPING, (body, callback) => IAmTyping({ body, socket, callback }));
	socket.on(SocketEvents.DELETE_MESSAGES, (body, callback) => deleteMessages({ body, socket, callback }));
};
