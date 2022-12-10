import { getServiceProvider, initialiseServiceAsClient } from '@adarsh-mishra/connects_you_services/index';
import { ProtoGrpcType as AuthProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/auth';
import { ProtoGrpcType as ChatProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/chat';
import { ProtoGrpcType as RoomProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/room';
import { ProtoGrpcType as UserProtoGrpcType } from '@adarsh-mishra/connects_you_services/services/user';
import dotenv from 'dotenv';

const ServiceProviders = {
	auth: (getServiceProvider('auth') as unknown as AuthProtoGrpcType).auth,
	chat: (getServiceProvider('chat') as unknown as ChatProtoGrpcType).chat,
	room: (getServiceProvider('room') as unknown as RoomProtoGrpcType).room,
	user: (getServiceProvider('user') as unknown as UserProtoGrpcType).user,
};

const getServiceClients = () => {
	dotenv.config();
	const auth = initialiseServiceAsClient({
		service: ServiceProviders.auth.AuthServices,
		address: process.env.USER_SERVICE_URL,
	});
	const user = initialiseServiceAsClient({
		service: ServiceProviders.user.UserServices,
		address: process.env.AUTH_SERVICE_URL,
	});
	const room = initialiseServiceAsClient({
		service: ServiceProviders.room.RoomServices,
		address: process.env.ROOM_SERVICE_URL,
	});
	const chat = initialiseServiceAsClient({
		service: ServiceProviders.chat.ChatServices,
		address: process.env.CHAT_SERVICE_URL,
	});
	return { auth, user, room, chat };
};

class SingletonServiceClients {
	private static instance?: SingletonServiceClients;
	private serviceClients: ReturnType<typeof getServiceClients>;
	private constructor() {
		this.serviceClients = getServiceClients();
	}
	public static getInstance(): SingletonServiceClients {
		if (!SingletonServiceClients.instance) {
			SingletonServiceClients.instance = new SingletonServiceClients();
		}
		return SingletonServiceClients.instance;
	}
	public getServiceClients() {
		return this.serviceClients;
	}
}

export const ServiceClients = SingletonServiceClients.getInstance();
