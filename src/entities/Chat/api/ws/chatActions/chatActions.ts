import { sendWS, WSRequest } from '@/shared/api';
import { logger } from '@/shared/lib/logger/logger';

export const markMessagesAsRead = (
	messageUids: string[],
	readerUid: string,
	chatKey: string,
	newReadStatus: boolean = true
) => {
	const validUids = messageUids.filter(uid => uid && !uid.startsWith('temp_'));
	if (validUids.length === 0 || !readerUid || !chatKey) {
		return;
	}

	validUids.forEach(uid => {
		const payload: WSRequest = {
			action: 'change_status_read_message',
			// request_uid убран — sendWS сгенерирует его сам
			object: {
				uid,
				reader_uid: readerUid,
				new_read_status: newReadStatus,
				chat_key: chatKey
			}
		};
		sendWS(payload).catch(err =>
			logger.error('WS send failed for read receipt:', err)
		);
	});
};

export const addMembersToChat = (chatKey: string, uids: string[]) =>
	sendWS({
		action: 'add_members_to_chat',
		object: { chat_key: chatKey, uid_users_list: uids }
	});
