import {
	ChatServicesClient,
	InsertMessageRequest,
	InsertMessageResponse,
} from '@adarsh-mishra/connects_you_services/services/chat';
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';
import { insertMessage } from '../_helper';

export type TSendMessageParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	body: InsertMessageRequest;
	callback: TSocketCallback<InsertMessageResponse>;
};

export const sendMessage = async ({ socket, body: message, callback }: TSendMessageParams) => {
	try {
		const response = await insertMessage(message, socket.data.grpcServiceClients?.chat as ChatServicesClient);
		callback?.(null, response);
		socket.broadcast.to(message.roomId!).emit(SocketEvents.ROOM_MESSAGE, { message });
	} catch (error) {
		callback?.(error);
	}
};
