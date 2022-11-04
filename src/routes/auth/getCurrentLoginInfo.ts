import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';

export const getCurrentLoginInfo = ({ grpcServiceClients, wrapperData }: THandlerData) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const meta = generateGRPCMetaData();
		client.getUserLoginInfo(
			{
				loginId: tokenData.loginId,
				userId: tokenData.userId,
			},
			meta,
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};
