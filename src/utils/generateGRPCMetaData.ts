import { grpc } from '@adarsh-mishra/connects_you_services';

const sanitizeMetadata = (meta: grpc.Metadata, metadata?: Record<string, string>) => {
	for (const key in metadata) {
		meta.add(key, metadata[key]);
	}
	return meta;
};

export const generateGRPCAuthMetaData = (metadata?: Record<string, string>) => {
	const meta = new grpc.Metadata();
	meta.add('api-key', process.env.AUTH_SERVICE_API_KEY);
	return sanitizeMetadata(meta, metadata);
};

export const generateGRPCUserMetaData = (metadata?: Record<string, string>) => {
	const meta = new grpc.Metadata();
	meta.add('api-key', process.env.USER_SERVICE_API_KEY);
	return sanitizeMetadata(meta, metadata);
};

export const generateGRPCRoomMetaData = (metadata?: Record<string, string>) => {
	const meta = new grpc.Metadata();
	meta.add('api-key', process.env.ROOM_SERVICE_API_KEY);
	return sanitizeMetadata(meta, metadata);
};

export const generateGRPCChatMetaData = (metadata?: Record<string, string>) => {
	const meta = new grpc.Metadata();
	meta.add('api-key', process.env.CHAT_SERVICE_API_KEY);
	return sanitizeMetadata(meta, metadata);
};
