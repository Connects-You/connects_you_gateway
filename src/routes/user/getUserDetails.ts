import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCUserMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { TUserDetailsParams } from '../../types/schema/user';

export const getUserDetails = async ({ body, grpcServiceClients }: THandlerData<TUserDetailsParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { userId } = body;
		const meta = generateGRPCUserMetaData();
		client.getUserDetails(
			{
				userId,
			},
			meta,
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};
