import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';

export type TIAmTypingParams = {
	body: { roomId: string; isTyping: boolean };
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	callback: TSocketCallback<void>;
};

export const IAmTyping = ({ socket, body, callback }: TIAmTypingParams) => {
	const { roomId, isTyping } = body;
	if (roomId) {
		callback?.(null);
		socket.broadcast.to(roomId).emit(SocketEvents.USER_TYPING, {
			user: socket.data.userDetails,
			roomId: roomId,
			isTyping,
		});
	}
};
