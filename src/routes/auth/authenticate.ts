import { AuthenticateRequest } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateRequest';
import { AuthenticateResponse } from '@adarsh-mishra/connects_you_services/services/auth/AuthenticateResponse';
import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { isEmptyEntity } from '@adarsh-mishra/node-utils/commonHelpers';

import { SocketEvents } from '../../events/socketEvents';
import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { generateGRPCAuthMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

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
		const meta = generateGRPCAuthMetaData();
		client.authenticate(
			{
				token,
				fcmToken,
				publicKey,
				clientMetaData,
			},
			meta,
			async (error, response) => {
				if (error) return rej(error);

				if (isEmptyEntity(response)) rej('Invalid response');
				const { user, loginInfo } = response!.data ?? {};
				if (!user || !loginInfo) return rej('Invalid response');
				res(response);

				const { userId, name, photoUrl, email, publicKey } = user;

				socketIO?.emit(SocketEvents.USER_CREATED, {
					user: {
						userId,
						name,
						photoUrl,
						email,
						publicKey,
					},
				});
				await setUserOnlineStatusHelper(userId, true, redisClient, socketIO!);
				if (response?.data?.method === AuthTypeEnum.LOGIN.toString())
					socketIO?.to(SocketEvents.MY_ROOM(userId)).emit(SocketEvents.MY_USER_LOGGED_IN, { loginInfo });
			},
		);
	});
};
