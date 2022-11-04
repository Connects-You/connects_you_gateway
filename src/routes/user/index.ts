import { handlerWrappers } from '../../helpers/handlerWrapper';

import { getAllUsers } from './getAllUsers';
import { getUserDetails } from './getUserDetails';

export const userHandlers = {
	getUserDetails: handlerWrappers(getUserDetails, {}),
	getAllUsers: handlerWrappers(getAllUsers, {}),
};
