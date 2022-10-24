import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { isEmptyEntity } from '@adarsh-mishra/node-utils';

import { RedisExpirationDuration, RedisKeys } from '../../constants';
import { resolverWrapper, TResolverData } from '../../helpers/resolverWrapper';
import { PubSubEventsEnum } from '../../types';
import {
	TAuthenticateParams,
	TUpdateFcmTokenParams,
	TUserLoginHistoryParams,
	TUserOnlineStatusParams,
} from '../../types/schema/auth';

const authenticateResolver = ({ args, ctx, wrapperData }: TResolverData<TAuthenticateParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.auth as AuthServicesClient;
		const { clientMetaData } = wrapperData;
		const params = args.params;
		client.authenticate(
			{
				token: params.token,
				fcmToken: params.fcmToken,
				publicKey: params.publicKey,
				clientMetaData,
			},
			async (err, response) => {
				if (err) rej(err);
				if (isEmptyEntity(response)) rej('Invalid response');
				res(response);
				const data = response!.data!;
				const user = data.user!;
				if (data.method === AuthTypeEnum.SIGNUP.toString()) {
					await ctx.pubSub?.publish(PubSubEventsEnum.USER_CREATED, {
						user: {
							name: user.name,
							email: user.email,
							userId: user.userId,
							photoUrl: user.photoUrl,
							publicKey: user.publicKey,
						},
					});
				}
				// await ctx.redisClient?.setex(
				// 	RedisKeys.userOnlineStatus(user.userId),
				// 	6 * RedisExpirationDuration['1h'],
				// 	'true',
				// );
				// await ctx.pubSub?.publish(PubSubEventsEnum.USER_ONLINE_STATUS_CHANGED, {
				// 	userId: user.userId,
				// 	isOnline: true,
				// });
			},
		);
	});
};

const signout = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		client.signout(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			async (err, response) => {
				if (err) rej(err);
				res(response);
				// await ctx.redisClient?.del(RedisKeys.userOnlineStatus(tokenData.userId));
				// await ctx.pubSub?.publish(PubSubEventsEnum.USER_ONLINE_STATUS_CHANGED, {
				// 	userId: tokenData.userId,
				// 	isOnline: false,
				// });
			},
		);
	});
};

const updateFcmToken = ({ args, ctx, wrapperData }: TResolverData<TUpdateFcmTokenParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		const params = args.params;
		client.updateFcmToken(
			{
				userId: tokenData.userId,
				fcmToken: params.fcmToken,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const refreshToken = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.auth as AuthServicesClient;
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

const setUserOnlineStatus = ({ args, ctx, wrapperData }: TResolverData<TUserOnlineStatusParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const params = args.params;
		client.setUserOnlineStatus(
			{
				isOnline: params.isOnline,
				userId: tokenData.userId,
			},
			async (err, response) => {
				if (err) rej(err);
				res(response);

				if (params.isOnline)
					await ctx.redisClient?.setex(
						RedisKeys.userOnlineStatus(tokenData.userId),
						6 * RedisExpirationDuration['1h'],
						'true',
					);
				else await ctx.redisClient?.del(RedisKeys.userOnlineStatus(tokenData.userId));

				await ctx.pubSub?.publish(PubSubEventsEnum.USER_ONLINE_STATUS_CHANGED, {
					userId: tokenData.userId,
					isOnline: params.isOnline,
				});
			},
		);
	});
};

const getMyDetails = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
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

const getCurrentLoginInfo = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
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

const getUserLoginHistory = ({ args, ctx, wrapperData }: TResolverData<TUserLoginHistoryParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const params = args.params;
		client.getUserLoginHistory(
			{
				nonValidAllowed: params.nonValidAllowed,
				limit: params.limit,
				offset: params.offset,
				userId: tokenData.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

export const authResolvers = {
	Query: {
		getMyDetails: resolverWrapper(getMyDetails, {
			isUserTokenVerificationRequired: true,
			isUserDataRefetchRequired: true,
		}),
		getCurrentLoginInfo: resolverWrapper(getCurrentLoginInfo, { isUserTokenVerificationRequired: true }),
		getUserLoginHistory: resolverWrapper(getUserLoginHistory, { isUserTokenVerificationRequired: true }),
	},
	Mutation: {
		authenticate: resolverWrapper(authenticateResolver, {
			isClientMetaDataRequired: true,
			isUserTokenVerificationRequired: true,
		}),
		signout: resolverWrapper(signout, {
			isUserTokenVerificationRequired: true,
		}),
		refreshToken: resolverWrapper(refreshToken, {
			isUserTokenVerificationRequired: true,
			isTokenVerificationRequiredWithoutExpiration: true,
			isClientMetaDataRequired: true,
		}),
		updateFcmToken: resolverWrapper(updateFcmToken, {
			isUserTokenVerificationRequired: true,
		}),
		setUserOnlineStatus: resolverWrapper(setUserOnlineStatus, {
			isUserTokenVerificationRequired: true,
		}),
	},
};
