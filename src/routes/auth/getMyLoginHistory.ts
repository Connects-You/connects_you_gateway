import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCUserMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { TUserLoginHistoryParams } from '../../types/schema/auth';

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
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};
