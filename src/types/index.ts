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
			PORT: number;
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
		}
	}
	namespace Express {
		interface Request {
			user?: IUser;
			grpcServiceClients?: typeof ServiceClients;
			redisClient?: Redis;
			socketIO?: SocketServer;
		}
	}
}
