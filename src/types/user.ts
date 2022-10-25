export interface IUser {
	email: string;
	emailHash: string;
	name: string;
	photoUrl: string;
	description?: string;
	publicKey: string;
	fcmToken: string;
	emailVerified: boolean;
	authProvider: string;
	locale: string;
	createdAt?: string;
	updatedAt?: string;
	userId?: string;
}

export type TTokenUser = {
	userId: string;
	loginId: string;
	type: 'INITIAL_TOKEN' | 'REFRESH_TOKEN';
};
