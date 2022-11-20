import {
	ChatServicesClient,
	InsertMessageRequest,
	MessageTypeEnum,
} from '@adarsh-mishra/connects_you_services/services/chat';
import {
	CreateGroupRoomRequest,
	CreateGroupRoomResponse,
	RoomServicesClient,
} from '@adarsh-mishra/connects_you_services/services/room';
import { Namespace, Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { SocketEvents } from '../../events/socketEvents';
import { TSocketCallback, TSocketData } from '../../types';
import { generateGRPCRoomMetaData } from '../../utils';
import { insertMessage } from '../_helper';

export type TCreateGroupRoomParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	roomNamespace: Namespace;
	body: Omit<CreateGroupRoomRequest, 'createdByUserId'>;
	callback: TSocketCallback<CreateGroupRoomResponse>;
};

export const createGroupRoom = async ({ body, socket, roomNamespace, callback }: TCreateGroupRoomParams) => {
	const roomClient = socket.data.grpcServiceClients?.room as RoomServicesClient;
	const senderUserDetails = socket.data.userDetails;
	const meta = generateGRPCRoomMetaData();

	roomClient.createGroupRoom(
		{
			...body,
			createdByUserId: senderUserDetails?.userId,
		},
		meta,
		async (error, response) => {
			if (error) return callback?.(error);
			callback?.(null, response);

			const room = response?.data?.room;
			if (room) {
				await socket.join(room.roomId);
				const connectedSockets = await roomNamespace.fetchSockets();

				const adminMessage: Pick<
					InsertMessageRequest,
					'messageText' | 'messageType' | 'roomId' | 'senderUserId'
				> = {
					messageText: `${senderUserDetails?.name} created this group`,
					messageType: MessageTypeEnum.TEXT,
					roomId: room.roomId,
					senderUserId: senderUserDetails?.userId,
				};

				await insertMessage(adminMessage, socket.data.grpcServiceClients?.chat as ChatServicesClient);

				room.roomUsers.forEach((user) => {
					if (user.userId !== senderUserDetails?.userId) {
						connectedSockets.forEach((socket) => {
							if ((socket.data as TSocketData).userDetails?.userId === user.userId) {
								socket.join(room.roomId);
								socket.emit(SocketEvents.ROOM_CREATED, { room });
								socket.emit(SocketEvents.ROOM_MESSAGE, { message: adminMessage });
							}
						});
					}
				});
			}
		},
	);
};
