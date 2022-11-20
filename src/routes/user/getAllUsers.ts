import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { TAllUsersParams } from '../../types/schema/user';
import { generateGRPCUserMetaData } from '../../utils/generateGRPCMetaData';
import { THandlerData } from '../../utils/handlerWrapper';

export const getAllUsers = ({ query, grpcServiceClients }: THandlerData<TAllUsersParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { exceptUserId, limit, offset } = query;
		const meta = generateGRPCUserMetaData();
		client.getAllUsers(
			{
				exceptUserId: exceptUserId as string,
				limit: limit as number,
				offset: offset as number,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
