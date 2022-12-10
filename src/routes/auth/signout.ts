import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { SignoutResponse } from '@adarsh-mishra/connects_you_services/services/auth/SignoutResponse';

import { SocketEvents } from '../../events/socketEvents';
import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { generateGRPCAuthMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const signout = ({ redisClient, grpcServiceClients, wrapperData, socketIO }: THandlerData) => {
	return new Promise<SignoutResponse | undefined>((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		const meta = generateGRPCAuthMetaData();
		client.signout(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			meta,
			async (error, response) => {
				if (error) return rej(error);
				res(response);

				const userId = tokenData.userId;

				await setUserOnlineStatusHelper(userId, false, redisClient, socketIO!);

				socketIO?.to(SocketEvents.MY_ROOM(userId)).emit(SocketEvents.MY_USER_SIGNOUT, {
					loginInfo: {
						loginId: tokenData.loginId,
						isValid: false,
					},
				});
			},
		);
	});
};
