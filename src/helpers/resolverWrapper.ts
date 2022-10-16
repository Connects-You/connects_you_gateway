import assert from 'assert';

import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { verifyAndDecodeJWT } from '@adarsh-mishra/node-utils/commonHelpers';
import { TGeoData } from '@adarsh-mishra/node-utils/commonHelpers/types';

import { IUser, TGraphqlContext, TTokenUser } from '../types';

import { fetchClientMetaData } from './fetchClientMetaData';

type TWrappers = {
	isUserDataRefetchRequired?: boolean;
	isUserTokenVerificationRequired?: boolean;
	isClientMetaDataRequired?: boolean;
	isTokenVerificationRequiredWithoutExpiration?: boolean;
};

export type TWrapperData = {
	userData: IUser;
	tokenData: TTokenUser;
	clientMetaData: { ip: string; userAgent: string; geoData: TGeoData };
};

export type TResolverData = { parent; args; ctx; info; wrapperData: TWrapperData };

const getUserTokenVerificationData = (
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

const getUserDetails = (userId, userClient) => {
	return new Promise((res, rej) => {
		userClient.getUserDetails({ userId }, (err, response) => {
			if (err) rej(err);
			res(response.data.user);
		});
	});
};

export const resolverWrapper =
	(resolver: (props: TResolverData) => void, wrappers: TWrappers) =>
	async (parent, args, ctx: TGraphqlContext, info) => {
		const {
			isUserDataRefetchRequired,
			isUserTokenVerificationRequired,
			isClientMetaDataRequired,
			isTokenVerificationRequiredWithoutExpiration,
		} = wrappers;
		let userData;
		let tokenData;
		let clientMetaData;
		try {
			if (isClientMetaDataRequired) {
				clientMetaData = await fetchClientMetaData(ctx.req);
			}

			assert(
				!isTokenVerificationRequiredWithoutExpiration || isUserTokenVerificationRequired,
				'isTokenVerificationRequiredWithoutExpiration can only be true if isUserTokenVerificationRequired is true',
			);
			assert(
				!isUserDataRefetchRequired || isUserTokenVerificationRequired,
				'isUserDataRefetchRequired can only be true if isUserTokenVerificationRequired is true',
			);

			if (isUserTokenVerificationRequired) {
				const tokenResult = getUserTokenVerificationData(
					ctx.req.headers['authorization'],
					isTokenVerificationRequiredWithoutExpiration,
				);
				tokenData = tokenResult;
				if (isUserDataRefetchRequired && tokenResult.userId) {
					const userClient = ctx.grpcServiceClients?.user as UserServicesClient;
					userData = await getUserDetails(tokenResult.userId, userClient);
				}
			}

			return resolver({ parent, args, ctx, info, wrapperData: { userData, tokenData, clientMetaData } });
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log('resolverWrapper error', error);
			return resolver({ parent, args, ctx, info, wrapperData: { userData, tokenData, clientMetaData } });
		}
	};
