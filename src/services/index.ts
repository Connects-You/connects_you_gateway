import { getServiceProvider, grpc } from '@adarsh-mishra/connects_you_services/index';
import { ProtoGrpcType as AuthProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/auth';
import { ProtoGrpcType as UserProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/user';

const ServiceProviders = {
	auth: (getServiceProvider('auth') as unknown as AuthProtoGrpcType).auth,
	user: (getServiceProvider('user') as unknown as UserProtoGrpcType).user,
};

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initializeClient = (service: any, port: number, serviceName: string) => {
	const client = new service(`0.0.0.0:${port}`, grpc.credentials.createInsecure());
	client.waitForReady(deadline, (error) => {
		if (error) {
			/* eslint-disable no-console */
			return console.error(`${serviceName} ->> 0.0.0.0:${port} error`, error);
		}
		console.log(`${serviceName} ->> 0.0.0.0:${port} is ready`);
		/* eslint-enable no-console */
	});
	return client;
};

export const ServiceClients = {
	auth: initializeClient(ServiceProviders.auth.AuthServices, 1000, 'auth'),
	user: initializeClient(ServiceProviders.user.UserServices, 1000, 'user'),
};
