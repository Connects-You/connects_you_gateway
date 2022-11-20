import { GetUserRoomsRequest, RoomServicesClient } from '@adarsh-mishra/connects_you_services/services/room';

import { generateGRPCUserMetaData, THandlerData } from '../../utils';

export const getUserRooms = ({
	grpcServiceClients,
	body,
	wrapperData,
}: THandlerData<Omit<GetUserRoomsRequest, 'userId'>>) => {
	return new Promise((res, rej) => {
		const client = grpcServiceClients?.room as RoomServicesClient;
		const { tokenData } = wrapperData;
		const { userId } = tokenData;

		const meta = generateGRPCUserMetaData();

		client.getUserRooms(
			{
				...body,
				userId,
			},
			meta,
			(error, response) => {
				if (error) return rej(error);
				res(response);
			},
		);
	});
};
