import { SentRead, SentTime, SentUnread } from '@icons/index';
import { MessageStatus } from '../../model/types/chat.types/chat.types';

interface MessageStatusNodeProps {
	status: MessageStatus;
	isOwn?: boolean;
}

export const MessageStatusNode = ({
	status,
	isOwn = true
}: MessageStatusNodeProps) => {
	// Не показываем статус для чужих сообщений (они всегда без галочек)
	if (!isOwn) {
		return null;
	}

	switch (status) {
		case MessageStatus.SENDING:
			return <SentTime className='sentTimeIcon' />;

		case MessageStatus.SENT:
		case MessageStatus.DELIVERED:
		case MessageStatus.UNREAD:
			return <SentUnread className='sentUnreadIcon' />;

		case MessageStatus.READ:
			return <SentRead className='sentReadIcon' />;

		case MessageStatus.ERROR:
			return null;

		default:
			return null;
	}
};
