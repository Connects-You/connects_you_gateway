import { UserDetails } from '@adarsh-mishra/connects_you_services/services/user/UserDetails';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { verifyAndDecodeJWT } from '@adarsh-mishra/node-utils/commonHelpers';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';

import { TTokenUser } from '../types';

import { RedisKeys } from './redisHelpers';

export const getUserTokenVerificationData = (
	authorization?: string,
	isTokenVerificationRequiredWithoutExpiration?: boolean,
) => {
	const [bearer, token] = authorization?.split(' ') ?? [];
	if (bearer !== 'Bearer' || !token) {
		throw new Error('Invalid token');
	}
	const tokenVerificationResponse = verifyAndDecodeJWT(
		token,
		process.env.SECRET,
		isTokenVerificationRequiredWithoutExpiration,
	);
	if (tokenVerificationResponse?.tokenExpiredError) throw new Error('Token Expired.');
	return tokenVerificationResponse?.result as TTokenUser;
};

export const getUserDetails = (userId: string, userClient?: UserServicesClient, redisClient?: Redis) => {
	return new Promise<UserDetails | null | undefined>((res, rej) => {
		if (!userClient || !redisClient) {
			return rej(new Error('UserClient or RedisClient not provided'));
		}
		userClient.getUserDetails({ userId }, (err, response) => {
			if (err) rej(err);
			const userData = response?.data?.user;
			if (!userData) rej(new Error('User not found'));
			redisClient.set(RedisKeys.userData(userId), JSON.stringify(userData)).catch(rej);
			res(userData);
		});
	});
};

export const getRedisUserOtherwiseFetchFresh = async (
	userId: string,
	userClient?: UserServicesClient,
	redisClient?: Redis,
) => {
	const redisUser = await redisClient?.get(RedisKeys.userData(userId));
	if (redisUser) return JSON.parse(redisUser);
	return getUserDetails(userId, userClient, redisClient);
};
