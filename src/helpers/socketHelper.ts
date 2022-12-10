import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server } from 'socket.io';

import { SocketEvents } from '../events/socketEvents';

import { RedisExpirationDuration, RedisKeys } from './redisHelpers';

export const setUserOnlineStatusHelper = async (
	userId: string,
	isOnline: boolean,
	redisClient?: Redis,
	io?: Server,
) => {
	if (isOnline) await redisClient?.setex(RedisKeys.userOnlineStatus(userId), 6 * RedisExpirationDuration['1h'], 1);
	else await redisClient?.del(RedisKeys.userOnlineStatus(userId));
	io?.emit(SocketEvents.USER_ONLINE_STATUS_CHANGED, { userId, isOnline });
	io?.emit(SocketEvents.USERID_ONLINE_STATUS_CHANGED(userId), { isOnline });
};
