import {
	ChatServicesClient,
	InsertMessageRequest,
	InsertMessageResponse,
} from '@adarsh-mishra/connects_you_services/services/chat';

export const insertMessage = (message: InsertMessageRequest, client: ChatServicesClient) => {
	return new Promise<InsertMessageResponse | undefined>((res, rej) => {
		client.insertMessage(message, (error, response) => {
			if (error) rej(error);
			res(response);
		});
	});
};
