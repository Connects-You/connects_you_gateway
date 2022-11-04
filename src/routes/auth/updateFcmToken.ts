import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { UpdateFcmTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/UpdateFcmTokenResponse';

import { generateGRPCAuthMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { TUpdateFcmTokenParams } from '../../types/schema/auth';

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
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};
