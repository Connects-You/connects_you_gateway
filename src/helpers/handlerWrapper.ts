import assert from 'assert';

import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';
import { TGeoData } from '@adarsh-mishra/node-utils/commonHelpers/types';
import { express } from '@adarsh-mishra/node-utils/expressHelpers';
import { UnauthorizedError } from '@adarsh-mishra/node-utils/httpResponses';
import { Redis } from '@adarsh-mishra/node-utils/redisHelpers';
import { Server as SocketServer } from 'socket.io';

import { ServiceClients } from '../services';
import { IUser, TTokenUser } from '../types';

import { errorHandler } from './errorHandler';
import { fetchClientMetaData } from './fetchClientMetaData';
import { getRedisUserOtherwiseFetchFresh, getUserDetails, getUserTokenVerificationData } from './userHelpers';

type TWrappers = {
	isUserDataRequired?: boolean;
	isUserFreshDataRequired?: boolean;
	isUserTokenVerificationRequired?: boolean;
	isClientMetaDataRequired?: boolean;
	isTokenVerificationRequiredWithoutExpiration?: boolean;
};

export type TWrapperData = {
	userData: IUser;
	tokenData: TTokenUser;
	clientMetaData: { ip: string; userAgent: string; geoData: TGeoData };
};

export type THandlerData<
	TReqBody = Record<string, unknown>,
	TQuery = Record<string, unknown>,
	TReqParam = Record<string, unknown>,
	THeader = Record<string, unknown>,
> = {
	params: TReqParam;
	body: TReqBody;
	query: TQuery;
	header: THeader;
	redisClient?: Redis;
	grpcServiceClients?: typeof ServiceClients;
	wrapperData: TWrapperData;
	socketIO?: SocketServer;
};

export const handlerWrappers =
	(resolver: (props: THandlerData) => void, wrappers: TWrappers) =>
	async (req: express.Request, res: express.Response) => {
		const {
			isUserDataRequired,
			isUserFreshDataRequired,
			isUserTokenVerificationRequired,
			isClientMetaDataRequired,
			isTokenVerificationRequiredWithoutExpiration,
		} = wrappers;
		let userData;
		let tokenData;
		let clientMetaData;
		try {
			if (isClientMetaDataRequired) {
				clientMetaData = await fetchClientMetaData(req);
			}
			assert(
				!isTokenVerificationRequiredWithoutExpiration || isUserTokenVerificationRequired,
				'isTokenVerificationRequiredWithoutExpiration can only be true if isUserTokenVerificationRequired is true',
			);
			assert(
				!isUserFreshDataRequired || isUserTokenVerificationRequired,
				'isUserFreshDataRequired can only be true if isUserTokenVerificationRequired is true',
			);
			assert(
				!isUserDataRequired || isUserTokenVerificationRequired,
				'isUserDataRequired can only be true if isUserTokenVerificationRequired is true',
			);
			assert(
				!isUserDataRequired || !isUserFreshDataRequired,
				'isUserDataRequired and isUserDataRefetchRequired cannot be true at the same time',
			);

			if (isUserTokenVerificationRequired) {
				const tokenResult = getUserTokenVerificationData(
					req.headers['authorization'],
					isTokenVerificationRequiredWithoutExpiration,
				);
				tokenData = tokenResult;
				if (isEmptyEntity(tokenResult)) throw new UnauthorizedError({ error: 'Invalid token' });
				const userClient = req.grpcServiceClients?.user as UserServicesClient;
				if (isUserFreshDataRequired) {
					userData = await getUserDetails(tokenResult.userId, userClient, req.redisClient);
				}
				if (isUserDataRequired) {
					userData = await getRedisUserOtherwiseFetchFresh(tokenResult.userId, userClient, req.redisClient);
				}
			}
			return resolver({
				wrapperData: { userData, tokenData, clientMetaData },
				body: req.body,
				grpcServiceClients: req.grpcServiceClients,
				header: req.headers,
				params: req.params,
				query: req.query,
				redisClient: req.redisClient,
				socketIO: req.socketIO,
			});
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log('resolverWrapper error', error);
			return errorHandler(res, error);
		}
	};
