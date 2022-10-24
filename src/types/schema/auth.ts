import { AuthTypeEnum } from '@adarsh-mishra/connects_you_services/services/auth/AuthTypeEnum';
import { ResponseStatusEnum } from '@adarsh-mishra/connects_you_services/services/auth/ResponseStatusEnum';

export type TAuthenticateParams = {
	token: string;
	publicKey: string;
	fcmToken: string;
};

export type TAuthenticatedUser = {
	userId: string;
	name: string;
	email: string;
	photoUrl: string;
	publicKey: string;
	token: string;
};

export type TAuthenticateResponseData = {
	method: AuthTypeEnum;
	user: TAuthenticatedUser;
};

export type TAuthenticateResponse = {
	responseStatus: ResponseStatusEnum;
	data: TAuthenticateResponseData;
};

export type TSignoutResponse = {
	responseStatus: ResponseStatusEnum;
};

export type TRefreshTokenResponseData = {
	token: string;
};

export type TRefreshTokenResponse = {
	responseStatus: ResponseStatusEnum;
	data: TRefreshTokenResponseData;
};

export type TUpdateFcmTokenParams = {
	fcmToken: string;
};

export type TUpdateFcmTokenResponse = {
	responseStatus: ResponseStatusEnum;
};

export type TGeoData = {
	status: string;
	message: string;
	continent: string;
	continentCodes: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: string;
	lon: string;
	timezone: string;
	offset: string;
	currency: string;
	isp: string;
	org: string;
	as: string;
	asname: string;
	reverse: string;
	mobile: string;
	proxy: string;
	hosting: string;
	query: string;
};

export type TClientMetaData = {
	ip: string;
	userAgent: string;
	geoData: TGeoData;
};

export type TLoginInfoData = {
	userId: string;
	loginId: string;
	loginMetaData: TClientMetaData;
	isValid: boolean;
	createdAt: string;
};

export type TCurrentLoginInfoData = {
	currentLoginInfo: TLoginInfoData;
};

export type TCurrentLoginInfoResponse = {
	responseStatus: ResponseStatusEnum;
	data: TCurrentLoginInfoData;
};

export type TUserLoginHistoryParams = {
	offset: number;
	limit: number;
	nonValidAllowed: boolean;
};

export type TUserLoginHistoryData = {
	loginHistory: Array<TLoginInfoData>;
};

export type TUserLoginHistoryResponse = {
	responseStatus: ResponseStatusEnum;
	data: TUserLoginHistoryData;
};

export type TUserOnlineStatusParams = {
	isOnline: boolean;
};

export type TUserOnlineStatusResponse = {
	responseStatus: ResponseStatusEnum;
};

export type TUserData = {
	userId: string;
	name: string;
	email: string;
	photoUrl: string;
	description: string;
	publicKey: string;
	createdAt: string;
	updatedAt: string;
};

export type TUserResponseData = {
	user: TUserData;
};

export type TUserResponse = {
	responseStatus: ResponseStatusEnum;
	data: TUserResponseData;
};
