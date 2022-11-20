import { AuthServicesClient } from '@adarsh-mishra/connects_you_services/services/auth/AuthServices';
import { RefreshTokenResponse } from '@adarsh-mishra/connects_you_services/services/auth/RefreshTokenResponse';

import { generateGRPCAuthMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const refreshToken = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise<RefreshTokenResponse | undefined>((res, rej) => {
		const client = grpcServiceClients?.auth as AuthServicesClient;
		const { clientMetaData, tokenData } = wrapperData;
		const meta = generateGRPCAuthMetaData();
		client.refreshToken(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
				clientMetaData: clientMetaData,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
