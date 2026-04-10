import { MessageOrdering } from '@/shared/model';
import {
	ChatType,
	GetMessagesRequest
} from '../../../types/chat.types/chat.types';

interface ResolveChatPropsInput {
	chatUid?: string;
	chatType?: ChatType;
	chatKey?: string;
	messagesQueryArgs?: GetMessagesRequest | null;
}

interface ResolveChatPropsDefaults {
	pageSize: number;
	ordering: MessageOrdering;
}

export const resolveChatProps = (
	props: ResolveChatPropsInput,
	defaults: ResolveChatPropsDefaults
) => {
	const chatUid = props.chatUid ?? '';
	const chatKey = props.chatKey;
	const chatType = props.chatType ?? (chatKey ? ChatType.GROUP : ChatType.CHAT);

	const messagesQueryArgs =
		props.messagesQueryArgs ??
		(chatUid
			? {
					user_uid: chatUid,
					page_size: defaults.pageSize,
					ordering: defaults.ordering
				}
			: null);

	return { chatUid, chatType, chatKey, messagesQueryArgs };
};
