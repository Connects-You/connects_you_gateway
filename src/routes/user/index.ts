import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { generateGRPCMetaData } from '../../helpers/generateGRPCMetaData';
import { handlerWrappers, THandlerData } from '../../helpers/handlerWrapper';
import { TAllUsersParams, TUserDetailsParams } from '../../types/schema/user';

const getUserDetails = async ({ body, grpcServiceClients }: THandlerData<TUserDetailsParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { userId } = body;
		const meta = generateGRPCMetaData();
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

const getAllUsers = ({ body, grpcServiceClients }: THandlerData<TAllUsersParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { exceptUserId, limit, offset } = body;
		const meta = generateGRPCMetaData();
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

export const userHandlers = {
	getUserDetails: handlerWrappers(getUserDetails, {}),
	getAllUsers: handlerWrappers(getAllUsers, {}),
};
