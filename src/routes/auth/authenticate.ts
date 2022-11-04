import { AuthenticateRequest } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateRequest';
import { AuthenticateResponse } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateResponse';
import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';

import { generateGRPCMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { setUserOnlineStatusHelper, SocketKeys } from '../../helpers/socketHelper';

export const authenticate = ({
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
		const meta = generateGRPCMetaData();
		client.authenticate(
			{
				token,
				fcmToken,
				publicKey,
				clientMetaData,
			},
			meta,
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
