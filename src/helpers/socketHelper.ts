import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server as SocketServer } from 'socket.io';

import { RedisExpirationDuration, RedisKeys } from './redisHelpers';

export const SocketKeys = {
	USER_ONLINE_STATUS_CHANGED: 'USER_ONLINE_STATUS_CHANGED',
	USERID_ONLINE_STATUS_CHANGED: (userId: string) => `USERID_ONLINE_STATUS_CHANGED:${userId}`,
	USER_CREATED: 'USER_CREATED',
	MY_ROOM: (userId: string) => `MY_ROOM:${userId}`,
	MY_USER_LOGGED_IN: 'MY_USER_LOGGED_IN',
	MY_USER_SIGNOUT: 'MY_USER_SIGNOUT',
};

export const setUserOnlineStatusHelper = async (
	redisClient: Redis,
	userId: string,
	isOnline: boolean,
	io: SocketServer,
) => {
	if (isOnline) await redisClient.setex(RedisKeys.userOnlineStatus(userId), 6 * RedisExpirationDuration['1h'], 1);
	else await redisClient.del(RedisKeys.userOnlineStatus(userId));
	io.emit(SocketKeys.USER_ONLINE_STATUS_CHANGED, { userId, isOnline });
	io.emit(SocketKeys.USERID_ONLINE_STATUS_CHANGED(userId), { isOnline });
};
