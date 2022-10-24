import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { resolverWrapper, TResolverData } from '../../helpers/resolverWrapper';
import { TAllUsersParams, TUserDetailsParams } from '../../types/schema/user';

const getUserDetails = async ({ args, ctx }: TResolverData<TUserDetailsParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
		const params = args.params;
		client.getUserDetails(
			{
				userId: params.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const getAllUsers = ({ args, ctx }: TResolverData<TAllUsersParams>) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients?.user as UserServicesClient;
		const params = args.params;
		client.getAllUsers(
			{
				exceptUserId: params.exceptUserId,
				limit: params.limit,
				offset: params.offset,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

export const userResolvers = {
	Query: {
		getUserDetails: resolverWrapper(getUserDetails, {}),
		getAllUsers: resolverWrapper(getAllUsers, {}),
	},
};
