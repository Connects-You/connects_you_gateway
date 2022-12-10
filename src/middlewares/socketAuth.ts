import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { UnauthorizedError } from '@adarsh-mishra/node-utils/httpResponses';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Socket } from 'socket.io';

import { getUserDetails, getUserTokenVerificationData } from '../helpers/userHelpers';
import { ServiceClients } from '../services';
import { TSocketData } from '../types';

export const socketAuthorization = async (socket: Socket, next: (error?: unknown) => void, redisClient: Redis) => {
	const { authorization, key } = socket.handshake.auth;
	if (!key || key !== process.env.API_KEY || !authorization)
		return next(new UnauthorizedError({ error: 'Authorization token is required' }));

	const grpcClients = ServiceClients.getServiceClients();
	const tokenResult = getUserTokenVerificationData(authorization, false);
	if (isEmptyEntity(tokenResult)) next(new UnauthorizedError({ error: 'Invalid token' }));

	const userClient = grpcClients.user as UserServicesClient;

	const userDetails = await getUserDetails(tokenResult.userId, userClient, redisClient);
	if (isEmptyEntity(userDetails)) next(new UnauthorizedError({ error: 'User not found' }));

	socket.data = { userDetails, redisClient, grpcServiceClients: grpcClients } as TSocketData;
	next();
};
