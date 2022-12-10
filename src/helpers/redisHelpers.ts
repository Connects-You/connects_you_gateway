import { redisConnection } from '@adarsh-mishra/node-utils/redisHelpers';

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

const isDevEnvironment = process.env.ENV === 'dev';

export const redisClient = redisConnection({
	redisHost: isDevEnvironment ? process.env.DEV_REDIS_HOST : process.env.PROD_REDIS_HOST,
	redisPort: isDevEnvironment ? process.env.DEV_REDIS_PORT : process.env.PROD_REDIS_PORT,
	redisDB: isDevEnvironment ? process.env.DEV_REDIS_DB : process.env.PROD_REDIS_DB,
	options: {
		password: isDevEnvironment ? undefined : process.env.PROD_REDIS_PASSWORD,
		username: isDevEnvironment ? undefined : process.env.PROD_REDIS_USERNAME,
	},
});
