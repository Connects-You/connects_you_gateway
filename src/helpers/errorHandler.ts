import { express } from '@adarsh-mishra/node-utils/expressHelpers';
import { InternalServerError, ResponseError } from '@adarsh-mishra/node-utils/httpResponses';

export const errorHandler = (res: express.Response, error: ResponseError<unknown>) => {
	if (error instanceof ResponseError) {
		res.status(error.statusCode).json(error);
	} else {
		const internalError = new InternalServerError({ error });
		res.status(internalError.statusCode).json(internalError);
	}
};
