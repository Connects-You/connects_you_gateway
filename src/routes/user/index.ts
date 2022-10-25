import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { handlerWrappers, THandlerData } from '../../helpers/handlerWrapper';
import { TAllUsersParams, TUserDetailsParams } from '../../types/schema/user';

const getUserDetails = async ({ body, grpcServiceClients }: THandlerData<TUserDetailsParams>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.user as UserServicesClient;
		const { userId } = body;
		client.getUserDetails(
			{
				userId,
			},
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
		client.getAllUsers(
			{
				exceptUserId,
				limit,
				offset,
			},
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
