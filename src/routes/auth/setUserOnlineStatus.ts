import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';

import { THandlerData } from '../../helpers/handlerWrapper';
import { setUserOnlineStatusHelper } from '../../helpers/socketHelper';
import { TUserOnlineStatusParams } from '../../types/schema/auth';

export const setUserOnlineStatus = async ({
	body,
	redisClient,
	wrapperData,
	socketIO,
}: THandlerData<TUserOnlineStatusParams>) => {
	const { tokenData } = wrapperData;
	const { isOnline } = body;
	const userId = tokenData.userId;

	await setUserOnlineStatusHelper(redisClient!, userId, isOnline, socketIO!);
	return {
		responseStatus: ResponseStatusEnum.SUCCESS,
	};
};
