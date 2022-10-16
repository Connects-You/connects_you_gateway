import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { resolverWrapper, TResolverData } from '../../helpers/resolverWrapper';

const authenticateResolver = ({ args, ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.auth as AuthServicesClient;
		const params = args.params;
		const { clientMetaData } = wrapperData;
		client.authenticate(
			{
				token: params.token,
				fcmToken: params.fcmToken,
				publicKey: params.publicKey,
				clientMetaData,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const signout = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		client.signout(
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

const updateFcmToken = ({ args, ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		client.updateFcmToken(
			{
				userId: tokenData.userId,
				fcmToken: args.fcmToken,
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
		const client = ctx.grpcServiceClients.auth as AuthServicesClient;
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
const setUserOnlineStatus = ({ args, ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.user as UserServicesClient;
		const { tokenData } = wrapperData;
		client.setUserOnlineStatus(
			{
				isOnline: args.isOnline,
				userId: tokenData.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const getMyDetails = ({ ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.user as UserServicesClient;
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
		const client = ctx.grpcServiceClients.user as UserServicesClient;
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

const getUserLoginHistory = ({ args, ctx, wrapperData }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.user as UserServicesClient;
		const { tokenData } = wrapperData;
		client.getUserLoginHistory(
			{
				nonValidAllowed: args.nonValidAllowed,
				limit: args.limit,
				offset: args.offset,
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
