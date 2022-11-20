import { handlerWrappers } from '../../utils/handlerWrapper';

import { getAllUsers } from './getAllUsers';
import { getMyDetails } from './getMyDetails';
import { getUserDetails } from './getUserDetails';

export const userHandlers = {
	getUserDetails: handlerWrappers(getUserDetails, {}),
	getAllUsers: handlerWrappers(getAllUsers, {}),
	getMyDetails: handlerWrappers(getMyDetails, {
		isUserTokenVerificationRequired: true,
		isUserFreshDataRequired: true,
	}),
};
