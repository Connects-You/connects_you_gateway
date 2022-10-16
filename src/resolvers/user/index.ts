import { UserServicesClient } from '@adarsh-mishra/connects_you_services/services/user/UserServices';

import { resolverWrapper, TResolverData } from '../../helpers/resolverWrapper';

const getUserDetails = ({ args, ctx }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.user as UserServicesClient;
		client.getUserDetails(
			{
				userId: args.userId,
			},
			(err, response) => {
				if (err) rej(err);
				res(response);
			},
		);
	});
};

const getAllUsers = ({ args, ctx }: TResolverData) => {
	return new Promise((res, rej) => {
		const client = ctx.grpcServiceClients.user as UserServicesClient;
		client.getAllUsers(
			{
				exceptUserId: args.exceptUserId,
				limit: args.limit,
				offset: args.offset,
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
