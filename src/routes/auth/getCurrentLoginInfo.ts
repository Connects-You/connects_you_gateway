import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCUserMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const getCurrentLoginInfo = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const meta = generateGRPCUserMetaData();
		client.getUserLoginInfo(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
