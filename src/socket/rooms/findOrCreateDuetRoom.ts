import {
	FindOrCreateDuetRoomRequest,
	FindOrCreateDuetRoomResponse,
	RoomServicesClient,
} from '@adarsh-mishra/connects_you_services/services/room';
import { Namespace, Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';
import { generateGRPCRoomMetaData } from '../../utils';

export type TFindOrCreateDuetRoomParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	roomNamespace: Namespace;
	body: Omit<FindOrCreateDuetRoomRequest, 'createdByUserId'>;
	callback: TSocketCallback<FindOrCreateDuetRoomResponse>;
};

export const findOrCreateDuetRoom = async ({ body, socket, roomNamespace, callback }: TFindOrCreateDuetRoomParams) => {
	const client = socket.data.grpcServiceClients?.room as RoomServicesClient;
	const userDetails = socket.data.userDetails;
	const { participantUserId } = body;
	const meta = generateGRPCRoomMetaData();

	client.findOrCreateDuetRoom(
		{
			createdByUserId: userDetails?.userId,
			participantUserId,
		},
		meta,
		async (error, response) => {
			if (error) return callback?.(error);
			callback?.(null, response);

			const room = response?.data?.room;
			if (room) {
				await socket.join(room.roomId);
				const otherRoomUser = room.roomUsers.find((user) => user.userId !== userDetails?.userId);
				if (otherRoomUser) {
					const otherSocket = (await roomNamespace.fetchSockets()).find(
						(socket) => (socket.data as TSocketData).userDetails?.userId === otherRoomUser.userId,
					);
					if (otherSocket) {
						otherSocket.join(room.roomId);
						otherSocket.emit(SocketEvents.ROOM_CREATED, { room });
					}
				}
			}
		},
	);
};
