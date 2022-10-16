import { fetchGeoData } from '@adarsh-mishra/node-utils';
import { Request } from 'express';

export const fetchClientMetaData = async (req: Request) => {
	return {
		ip: req.ip,
		userAgent: req.header('user-agent'),
		geoData: process.env.ENV === 'prod' ? await fetchGeoData(req.ip) : undefined,
	};
};
