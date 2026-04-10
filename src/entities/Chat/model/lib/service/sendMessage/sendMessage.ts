import { logger } from '@/shared/lib/logger/logger';
import {
	ChatType,
	SendMessageParams
} from '../../../types/chat.types/chat.types';
import { sendWS } from '@/shared/api/WS/services/socketClient/socketClient';

interface WSMessagePayload {
	action: 'create_text_message';
	request_uid: string;
	object: {
		content: string;
		status: 'publish';
		files: Array<{ filename: string; data: string; type?: string }>;
		replied_messages: string[];
		forwarded_messages: string[];
		to_user_uid?: string;
		chat_key?: string;
		message_attachment_uids?: string[];
	};
}

const generateRequestId = (): string => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export async function sendMessage(
	chatUid: string,
	chatType: ChatType,
	params: SendMessageParams,
	currentUserId: string,
	chatKey?: string
): Promise<void> {
	if (params.files?.length && params.forwardIds?.length) {
		logger.error('Cannot send files and forwarded messages simultaneously');
		throw new Error('Files and forwarded messages are mutually exclusive');
	}

	const payload: WSMessagePayload = {
		action: 'create_text_message',
		request_uid: generateRequestId(),
		object: {
			content: params.content ?? '',
			status: 'publish',
			files: params.files ?? [],

			replied_messages: params.replyIds?.filter(id => id !== null) ?? [],
			forwarded_messages: params.forwardIds?.filter(id => id !== null) ?? [],
			message_attachment_uids:
				params.attachmentUids?.filter(id => id !== null) ?? []
		}
	};

	if (chatType === ChatType.CHAT) {
		payload.object.to_user_uid = chatUid;
		payload.object.chat_key = undefined;
	} else {
		payload.object.chat_key = chatKey || chatUid;
		payload.object.to_user_uid = undefined;
	}

	return sendWS(payload);
}
