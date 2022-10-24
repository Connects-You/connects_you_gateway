import { ForbiddenError } from '@adarsh-mishra/node-utils/httpResponses';
import { NextFunction, Request, Response } from 'express';

export const validateAccess = (req: Request, res: Response, next: NextFunction) => {
	const apiKey = req.headers['api-key'];
	if (apiKey === process.env.API_KEY || process.env.ENV === 'dev') next();
	else {
		const error = new ForbiddenError({ error: 'Invalid API Key' });
		res.status(error.statusCode).json(error);
	}
};
