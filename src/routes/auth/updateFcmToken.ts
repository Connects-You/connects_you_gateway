import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { UpdateFcmTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenResponse';

import { TUpdateFcmTokenParams } from '../../types/schema/auth';
import { generateGRPCAuthMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const updateFcmToken = ({ body, grpcServiceClients, wrapperData }: THandlerData<TUpdateFcmTokenParams>) => {
	return new Promise<UpdateFcmTokenResponse | undefined>((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { tokenData } = wrapperData;
		const { fcmToken } = body;
		const meta = generateGRPCAuthMetaData();
		client.updateFcmToken(
			{
				userId: tokenData.userId,
				fcmToken,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
