import { RoomServicesClient } from '@adarsh-mishra/connects_you_services/services/room';
import { BadRequestError } from '@adarsh-mishra/node-utils/httpResponses';
import { ServiceError } from '@grpc/grpc-js';
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

import { TSocketCallback, TSocketData } from '../../types';

export type TJoinRoomIdsParams = {
	socket: Socket<EventsMap, EventsMap, EventsMap, TSocketData>;
	body: { roomIds: Array<string> };
	callback: TSocketCallback<boolean>;
};

export const joinRoomIds = ({ body, socket, callback }: TJoinRoomIdsParams) => {
	const { roomIds } = body;
	const { grpcServiceClients, userDetails } = socket.data;

	(grpcServiceClients?.room as RoomServicesClient).getUserRooms(
		{ userId: userDetails?.userId },
		async (error, response) => {
			if (error) return callback?.(error);

			const { data } = response ?? {};
			const { rooms } = data ?? {};

			let isRoomIdsCorrect = true;
			for (const roomId of roomIds) {
				if (rooms?.findIndex((room) => room.roomId === roomId) === -1) {
					isRoomIdsCorrect = false;
					break;
				}
			}
			if (!isRoomIdsCorrect) {
				return callback?.(new BadRequestError({ error: 'Invalid roomIds' }) as unknown as ServiceError);
			}

			await socket.join(roomIds);
			callback?.(null, true);
		},
	);
};
