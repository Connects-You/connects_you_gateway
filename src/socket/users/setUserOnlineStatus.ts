import { Server, Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { TSocketCallback, TSocketData } from '../../types';
import { TUserOnlineStatusParams } from '../../types/schema/auth';

export type TSetUserOnlineStatusParams = {
	body: TUserOnlineStatusParams;
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	io: Server;
	callback: TSocketCallback<void>;
};

export const setUserOnlineStatus = async ({ body, io, socket, callback }: TSetUserOnlineStatusParams) => {
	const { isOnline } = body;
	const { userId } = socket.data.userDetails ?? {};
	const redisClient = socket.data.redisClient;

	await setUserOnlineStatusHelper(userId!, isOnline, redisClient, io);

	callback?.(null);
};
