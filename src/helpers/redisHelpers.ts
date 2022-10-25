export const RedisKeys = {
	userOnlineStatus: (userId: string) => `userOnlineStatus:${userId}`,
	userData: (userId: string) => `userData:${userId}`,
};

export const RedisExpirationDuration = {
	'1d': 86400,
	'1h': 3600,
	'1m': 60,
	'1s': 1,
};
