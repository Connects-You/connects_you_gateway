/* eslint-disable @typescript-eslint/naming-convention */

import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server as SocketServer } from 'socket.io';

import { ServiceClients } from '../services';

import { IUser } from './user';

export * from './user';
export * from './userLoginHistory';
export * from './userRefreshToken';
export * from './socket';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			URL: string;
			API_KEY: string;
			ENV: 'dev' | 'prod';
			SECRET: string;
			DEV_REDIS_HOST: string;
			DEV_REDIS_PORT: number;
			DEV_REDIS_DB: number;
			PROD_REDIS_HOST: string;
			PROD_REDIS_PORT: number;
			PROD_REDIS_DB: number;
			PROD_REDIS_PASSWORD: string;
			PROD_REDIS_USERNAME: string;
			USER_SERVICE_URL: string;
			AUTH_SERVICE_URL: string;
			ROOM_SERVICE_URL: string;
			CHAT_SERVICE_URL: string;
			USER_SERVICE_API_KEY: string;
			AUTH_SERVICE_API_KEY: string;
			ROOM_SERVICE_API_KEY: string;
			CHAT_SERVICE_API_KEY: string;
		}
	}
	namespace Express {
		interface Request {
			user?: IUser;
			grpcServiceClients?: ReturnType<typeof ServiceClients.getServiceClients>;
			redisClient?: Redis;
			socketIO?: SocketServer;
		}
	}
}
