import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { ServiceError } from '@grpc/grpc-js';

import { ServiceClients } from '../services';

import { IUser } from './user';

export type TSocketData = {
	userDetails?: IUser;
	redisClient?: Redis;
	grpcServiceClients: typeof ServiceClients;
};

export type TSocketCallback<T = undefined> = ((error?: ServiceError | null, data?: T | null) => void) | undefined;
