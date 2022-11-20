import {
	ChatServicesClient,
	RemoveMessagesRequest,
	RemoveMessagesResponse,
} from '@adarsh-mishra/connects_you_services/services/chat';
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';

export type TDeleteMessagesParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	body: RemoveMessagesRequest & { roomId: string };
	callback: TSocketCallback<RemoveMessagesResponse>;
};

export const deleteMessages = ({ socket, body, callback }: TDeleteMessagesParams) => {
	const { messageIds, roomId } = body;
	const chatClient = socket.data.grpcServiceClients?.chat as ChatServicesClient;

	chatClient.removeMessages({ messageIds }, (error, response) => {
		if (error) return callback?.(error);
		callback?.(null, response);

		socket.broadcast.to(roomId).emit(SocketEvents.MESSAGES_DELETED, { messageIds });
	});
};
