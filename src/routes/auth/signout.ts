import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { SignoutResponse } from '@adarsh-mishra/connects_you_services/services/auth/SignoutResponse';

import { generateGRPCAuthMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { setUserOnlineStatusHelper, SocketKeys } from '../../helpers/socketHelper';

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
