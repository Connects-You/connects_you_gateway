import { handlerWrappers } from '../../utils';

import { getUserRooms } from './getUserRooms';

export const roomHandlers = {
	getUserRooms: handlerWrappers(getUserRooms, { isUserTokenVerificationRequired: true }),
};
