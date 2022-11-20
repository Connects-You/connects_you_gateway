import {
	ChatServicesClient,
	InsertMessageSeenInfoForMessagesRequest,
	InsertMessageSeenInfoForMessagesResponse,
} from '@adarsh-mishra/connects_you_services/services/chat';
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';

export type TMessageSeenParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	body: InsertMessageSeenInfoForMessagesRequest & { roomId: string };
	callback: TSocketCallback<InsertMessageSeenInfoForMessagesResponse>;
};

export const messageSeen = ({ body, socket, callback }: TMessageSeenParams) => {
	const { roomId } = body;

	const chatClient = socket.data.grpcServiceClients?.chat as ChatServicesClient;

	chatClient.insertMessageSeenInfoForMessages(body, (error, response) => {
		if (error) return callback?.(error);
		callback?.(null, response);

		socket.broadcast.to(roomId).emit(SocketEvents.MESSAGE_SEEN, body);
	});
};
