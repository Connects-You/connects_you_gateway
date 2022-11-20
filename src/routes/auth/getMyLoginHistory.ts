import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { TUserLoginHistoryParams } from '../../types/schema/auth';
import { generateGRPCUserMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const getMyLoginHistory = ({ body, grpcServiceClients, wrapperData }: THandlerData<TUserLoginHistoryParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { tokenData } = wrapperData;
		const { limit, nonValidAllowed, offset } = body;
		const meta = generateGRPCUserMetaData();
		client.getUserLoginHistory(
			{
				nonValidAllowed,
				limit,
				offset,
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
