import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCUserMetaData } from '../../helpers/generateGRPCMetaData';
import { THandlerData } from '../../helpers/handlerWrapper';
import { TAllUsersParams } from '../../types/schema/user';

export const getAllUsers = ({ body, grpcServiceClients }: THandlerData<TAllUsersParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { exceptUserId, limit, offset } = body;
		const meta = generateGRPCUserMetaData();
		client.getAllUsers(
			{
				exceptUserId,
				limit,
				offset,
			},
			meta,
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};
