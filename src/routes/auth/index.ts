import { handlerWrappers } from '../../helpers/handlerWrapper';

import { authenticate } from './authenticate';
import { getCurrentLoginInfo } from './getCurrentLoginInfo';
import { getMyDetails } from './getMyDetails';
import { getMyLoginHistory } from './getMyLoginHistory';
import { refreshToken } from './refreshToken';
import { setUserOnlineStatus } from './setUserOnlineStatus';
import { signout } from './signout';
import { updateFcmToken } from './updateFcmToken';

export const authHandlers = {
	getMyDetails: handlerWrappers(getMyDetails, {
		isUserTokenVerificationRequired: true,
		isUserFreshDataRequired: true,
	}),
	getCurrentLoginInfo: handlerWrappers(getCurrentLoginInfo, { isUserTokenVerificationRequired: true }),
	getMyLoginHistory: handlerWrappers(getMyLoginHistory, { isUserTokenVerificationRequired: true }),

	authenticate: handlerWrappers(authenticate, {
		isClientMetaDataRequired: true,
		isUserTokenVerificationRequired: true,
	}),
	signout: handlerWrappers(signout, {
		isUserTokenVerificationRequired: true,
	}),
	refreshToken: handlerWrappers(refreshToken, {
		isUserTokenVerificationRequired: true,
		isTokenVerificationRequiredWithoutExpiration: true,
		isClientMetaDataRequired: true,
	}),
	updateFcmToken: handlerWrappers(updateFcmToken, {
		isUserTokenVerificationRequired: true,
	}),
	setUserOnlineStatus: handlerWrappers(setUserOnlineStatus, {
		isUserTokenVerificationRequired: true,
	}),
};
