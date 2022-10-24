import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/user/ResponseStatusEnum';

import { TUserResponse } from './auth';

export type TUserDetailsParams = {
	userId: string;
};

export type TUserDetailsData = {
	user: TUserResponse;
};

export type TUserDetailsResponse = {
	responseStatus: ResponseStatusEnum;
	data: TUserDetailsData;
};

export type TAllUsersParams = {
	limit: number;
	offset: number;
	exceptUserId: string;
};

export type TAllUsersData = {
	users: Array<TUserResponse>;
};

export type TAllUsersResponse = {
	responseStatus: ResponseStatusEnum;
	data: TAllUsersData;
};
