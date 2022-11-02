import { grpc } from '@adarsh-mishra/connects_you_services';

export const generateGRPCMetaData = (metadata?: Record<string, string>) => {
	const meta = new grpc.Metadata();
	// every endpoint should have api-key header
	meta.add('api-key', process.env.API_KEY);
	for (const key in metadata) {
		meta.add(key, metadata[key]);
	}
	return meta;
};
