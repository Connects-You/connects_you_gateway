import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';

import { IUser } from './user';

export type TSocketData = {
	userDetails?: IUser;
	redisClient?: Redis;
	userClient?: UserServicesClient;
	authClient?: AuthServicesClient;
};
