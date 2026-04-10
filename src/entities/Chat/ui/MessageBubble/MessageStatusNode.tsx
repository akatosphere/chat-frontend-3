import { SentRead, SentTime, SentUnread } from '@icons/index';
import { MessageStatus } from '../../model/types/chat.types/chat.types';

interface MessageStatusNodeProps {
	status: MessageStatus | 'received' | 'sending' | 'unread' | 'read';
}

export const MessageStatusNode = ({ status }: MessageStatusNodeProps) => {
	const s = status as MessageStatus;

	if (s === MessageStatus.RECEIVED) {
		return null;
	}

	if (s === MessageStatus.SENDING) {
		return <SentTime className='sentTimeIcon' />;
	}

	if (s === MessageStatus.UNREAD) {
		return <SentUnread className='sentUnreadIcon' />;
	}

	if (s === MessageStatus.READ) {
		return <SentRead className='sentReadIcon' />;
	}

	return null;
};
