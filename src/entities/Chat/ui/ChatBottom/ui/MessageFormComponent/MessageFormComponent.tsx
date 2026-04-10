'use client';

import { useCallback, useState, useRef } from 'react';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { MessageForm, MessageFormRef } from '../MessageForm/MessageForm';
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import { Button, ButtonColor, ButtonType } from '@/shared/ui/Button';
import { SendIcon } from '@icons/index';
import {
	ChatType,
	GetMessagesRequest,
	VoiceFile
} from '@/entities/Chat/model/types/chat.types/chat.types';
import { MESSAGES_ORDERING, MESSAGES_PAGE_SIZE } from '@/shared/model';
import { useChatSender } from '@/entities/Chat/model/lib/hooks/useChatSender/useChatSender';
import { resolveChatProps } from '@/entities/Chat/model/lib/utils/resolveChatProps/resolveChatProps';

import cls from './MessageFormComponent.module.scss';
export interface MessageFormComponentProps {
	chatUid?: string;
	chatType?: ChatType;
	messagesQueryArgs?: GetMessagesRequest | null;
	chatKey?: string;
}

export function MessageFormComponent({
	chatUid: propChatUid,
	chatType: propChatType,
	messagesQueryArgs: propMessagesQueryArgs,
	chatKey: propChatKey
}: MessageFormComponentProps) {
	const [, setFiles] = useState<VoiceFile[]>([]);
	const [isTextFilled, setIsTextFilled] = useState<boolean>(false);
	const [messageText, setMessageText] = useState('');

	const formRef = useRef<MessageFormRef>(null);

	// ─────────────────────────────────────────────────────────────

	const { chatUid, chatType, chatKey, messagesQueryArgs } = resolveChatProps(
		{
			chatUid: propChatUid,
			chatType: propChatType,
			chatKey: propChatKey,
			messagesQueryArgs: propMessagesQueryArgs
		},
		{ pageSize: MESSAGES_PAGE_SIZE, ordering: MESSAGES_ORDERING }
	);

	// ─────────────────────────────────────────────────────────────

	const { send } = useChatSender(chatUid, chatType, chatKey);

	const handleSend = useCallback(
		(message: string) => send({ content: message }, messagesQueryArgs!),
		[send, messagesQueryArgs]
	);

	const handleSendVoice = useCallback(
		(voice: VoiceFile) => send({ files: [voice] }, messagesQueryArgs!),
		[send, messagesQueryArgs]
	);

	// ─────────────────────────────────────────────────────────────

	const isDisabled = !chatUid;

	return (
		<section className={cls.messageFormComponent}>
			<AttachmentButton setFiles={setFiles} disabled={isDisabled} />

			<MessageForm
				ref={formRef}
				onSendContent={handleSend}
				disabled={isDisabled}
				onTextChanged={setIsTextFilled}
				onMessageChange={setMessageText}
				onReset={() => setMessageText('')}
			/>

			{!isTextFilled ? (
				<VoiceRecorder onSendVoice={handleSendVoice} disabled={isDisabled} />
			) : (
				<Button
					btnType={ButtonType.BUTTON}
					color={ButtonColor.TRANSPARENT}
					className={cls.button}
					aria-label='Отправить сообщение'
					disabled={isDisabled || !messageText.trim()}
					onClick={() => {
						const trimmed = messageText.trim();
						if (trimmed) {
							handleSend(trimmed);
							formRef.current?.reset();
						}
					}}
				>
					<SendIcon width={36} height={36} />
				</Button>
			)}
		</section>
	);
}
