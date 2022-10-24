import { verifyAndDecodeJWT } from '@adarsh-mishra/node-utils';

import { TTokenUser } from '../types';

export const getUserTokenVerificationData = (
	authorization?: string,
	isTokenVerificationRequiredWithoutExpiration?: boolean,
) => {
	const [bearer, token] = authorization?.split(' ') ?? [];
	if (bearer !== 'Bearer' || !token) {
		throw new Error('Invalid token');
	}
	const tokenVerificationResponse = verifyAndDecodeJWT(
		token,
		process.env.SECRET,
		isTokenVerificationRequiredWithoutExpiration,
	);
	if (tokenVerificationResponse?.tokenExpiredError) throw new Error('Token Expired.');
	return tokenVerificationResponse?.result as TTokenUser;
};

export const getUserDetails = (userId, userClient) => {
	return new Promise((res, rej) => {
		userClient.getUserDetails({ userId }, (err, response) => {
			if (err) rej(err);
			res(response.data.user);
		});
	});
};
