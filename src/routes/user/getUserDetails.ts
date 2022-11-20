import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { TUserDetailsParams } from '../../types/schema/user';
import { generateGRPCUserMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const getUserDetails = async ({ query, grpcServiceClients }: THandlerData<TUserDetailsParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { userId } = query;
		const meta = generateGRPCUserMetaData();
		client.getUserDetails(
			{
				userId: userId as string,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
