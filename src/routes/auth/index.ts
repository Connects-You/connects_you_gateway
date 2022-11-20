import { handlerWrappers } from '../../utils/handlerWrapper';

import { authenticate } from './authenticate';
import { getCurrentLoginInfo } from './getCurrentLoginInfo';
import { getMyLoginHistory } from './getMyLoginHistory';
import { refreshToken } from './refreshToken';
import { signout } from './signout';
import { updateFcmToken } from './updateFcmToken';

export const authHandlers = {
	getCurrentLoginInfo: handlerWrappers(getCurrentLoginInfo, { isUserTokenVerificationRequired: true }),
	getMyLoginHistory: handlerWrappers(getMyLoginHistory, { isUserTokenVerificationRequired: true }),

	authenticate: handlerWrappers(authenticate, {
		isClientMetaDataRequired: true,
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
};
