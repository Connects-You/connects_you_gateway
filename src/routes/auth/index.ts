import { AuthenticateRequest } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateRequest';
import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';

import { RedisExpirationDuration, RedisKeys } from '../../helpers';
import { handlerWrappers, THandlerData } from '../../helpers/handlerWrapper';
import { TUpdateFcmTokenParams, TUserLoginHistoryParams, TUserOnlineStatusParams } from '../../types/schema/auth';

const authenticate = ({
	body,
	wrapperData,
	grpcServiceClients,
	redisClient,
}: THandlerData<Pick<AuthenticateRequest, 'fcmToken' | 'publicKey' | 'token'>>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { clientMetaData } = wrapperData;
		const { fcmToken, publicKey, token } = body;
		client.authenticate(
			{
				token,
				fcmToken,
				publicKey,
				clientMetaData,
			},
			async (err, response) => {
				if (err) rej(err);
				if (isEmptyEntity(response)) rej('Invalid response');
				res(response);
				const data = response!.data!;
				const user = data.user!;
				await redisClient?.setex(RedisKeys.userOnlineStatus(user.userId), 6 * RedisExpirationDuration['1h'], 1);

				// TODO: publish user online status via socket
				// if (data.method === AuthTypeEnum.SIGNUP.toString()) {
				// 	await ctx.pubSub?.publish(PubSubEventsEnum.USER_CREATED, {
				// 		user: {
				// 			name: user.name,
				// 			email: user.email,
				// 			userId: user.userId,
				// 			photoUrl: user.photoUrl,
				// 			publicKey: user.publicKey,
				// 		},
				// 	});
				// }
				// await ctx.pubSub?.publish(PubSubEventsEnum.USER_ONLINE_STATUS_CHANGED, {
				// 	userId: user.userId,
				// 	isOnline: true,
				// });
			},
		);
	});
};

const signout = ({ redisClient, grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		client.signout(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			async (err, response) => {
				if (err) rej(err);
				res(response);
				await redisClient?.del(RedisKeys.userOnlineStatus(tokenData.userId));
				// TODO: publish user online status via socket
				// await ctx.pubSub?.publish(PubSubEventsEnum.USER_ONLINE_STATUS_CHANGED, {
				// 	userId: tokenData.userId,
				// 	isOnline: false,
				// });
			},
		);
	});
};

const updateFcmToken = ({ body, grpcServiceClients, wrapperData }: THandlerData<TUpdateFcmTokenParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		const { fcmToken } = body;
		client.updateFcmToken(
			{
				userId: tokenData.userId,
				fcmToken,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const refreshToken = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { clientMetaData, tokenData } = wrapperData;
		client.refreshToken(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
				clientMetaData: clientMetaData,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const setUserOnlineStatus = async ({ body, redisClient, wrapperData }: THandlerData<TUserOnlineStatusParams>) => {
	const { tokenData } = wrapperData;
	const { isOnline } = body;

	if (isOnline)
		await redisClient?.setex(RedisKeys.userOnlineStatus(tokenData.userId), 6 * RedisExpirationDuration['1h'], 1);
	else await redisClient?.del(RedisKeys.userOnlineStatus(tokenData.userId));
	// TODO: publish user online status via socket
};

const getMyDetails = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		client.getUserDetails(
			{
				userId: tokenData.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const getCurrentLoginInfo = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		client.getUserLoginInfo(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const getUserLoginHistory = ({ body, grpcServiceClients, wrapperData }: THandlerData<TUserLoginHistoryParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const { limit, nonValidAllowed, offset } = body;
		client.getUserLoginHistory(
			{
				nonValidAllowed,
				limit,
				offset,
				userId: tokenData.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

export const authHandlers = {
	getMyDetails: handlerWrappers(getMyDetails, {
		isUserTokenVerificationRequired: true,
		isUserFreshDataRequired: true,
	}),
	getCurrentLoginInfo: handlerWrappers(getCurrentLoginInfo, { isUserTokenVerificationRequired: true }),
	getUserLoginHistory: handlerWrappers(getUserLoginHistory, { isUserTokenVerificationRequired: true }),

	authenticate: handlerWrappers(authenticate, {
		isClientMetaDataRequired: true,
		isUserTokenVerificationRequired: true,
	}),
	signout: handlerWrappers(signout, {
		isUserTokenVerificationRequired: true,
	}),
	refreshToken: handlerWrappers(refreshToken, {
		isUserTokenVerificationRequired: true,
		isTokenVerificationRequiredWithoutExpiration: true,
		isClientMetaDataRequired: true,
	}),
	updateFcmToken: handlerWrappers(updateFcmToken, {
		isUserTokenVerificationRequired: true,
	}),
	setUserOnlineStatus: handlerWrappers(setUserOnlineStatus, {
		isUserTokenVerificationRequired: true,
	}),
};
