import { AuthenticateRequest } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateRequest';
import { AuthenticateResponse } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateResponse';
import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { RefreshTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenResponse';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';
import { SignoutResponse } from '@adarsh-mishra/connects_you_services/services/auth/SignoutResponse';
import { UpdateFcmTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenResponse';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';

import { RedisExpirationDuration, RedisKeys } from '../../helpers';
import { handlerWrappers, THandlerData } from '../../helpers/handlerWrapper';
import { setUserOnlineStatusHelper, SocketKeys } from '../../helpers/socketHelper';
import { TUpdateFcmTokenParams, TUserLoginHistoryParams, TUserOnlineStatusParams } from '../../types/schema/auth';

const authenticate = ({
	body,
	wrapperData,
	grpcServiceClients,
	redisClient,
	socketIO,
}: THandlerData<Pick<AuthenticateRequest, 'fcmToken' | 'publicKey' | 'token'>>) => {
	return new Promise<AuthenticateResponse | undefined>((res, rej) => {
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
				const { user, loginInfo } = response!.data ?? {};
				if (!user || !loginInfo) return rej('Invalid response');
				res(response);

				const { userId, name, photoUrl, email, publicKey } = user;

				await setUserOnlineStatusHelper(redisClient!, userId, true, socketIO!);
				socketIO?.emit(SocketKeys.USER_CREATED, {
					user: {
						userId,
						name,
						photoUrl,
						email,
						publicKey,
					},
				});
				if (response?.data?.method === AuthTypeEnum.LOGIN.toString())
					socketIO?.to(SocketKeys.MY_ROOM(userId)).emit(SocketKeys.MY_USER_LOGGED_IN, { loginInfo });
			},
		);
	});
};

const signout = ({ redisClient, grpcServiceClients, wrapperData, socketIO }: THandlerData) => {
	return new Promise<SignoutResponse | undefined>((res, rej) => {
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

				const userId = tokenData.userId;

				await setUserOnlineStatusHelper(redisClient!, userId, true, socketIO!);

				socketIO?.to(SocketKeys.MY_ROOM(userId)).emit(SocketKeys.MY_USER_SIGNOUT, {
					loginInfo: {
						loginId: tokenData.loginId,
						isValid: false,
					},
				});
			},
		);
	});
};

const updateFcmToken = ({ body, grpcServiceClients, wrapperData }: THandlerData<TUpdateFcmTokenParams>) => {
	return new Promise<UpdateFcmTokenResponse | undefined>((res, rej) => {
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
	return new Promise<RefreshTokenResponse | undefined>((res, rej) => {
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

const setUserOnlineStatus = async ({
	body,
	redisClient,
	wrapperData,
	socketIO,
}: THandlerData<TUserOnlineStatusParams>) => {
	const { tokenData } = wrapperData;
	const { isOnline } = body;
	const userId = tokenData.userId;

	await setUserOnlineStatusHelper(redisClient!, userId, isOnline, socketIO!);
	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
	};
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
