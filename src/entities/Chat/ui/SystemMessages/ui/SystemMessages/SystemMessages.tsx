import React from 'react';
import {
	SystemMessageData,
	SystemEventType,
	ChatCreatedData,
	MemberJoinedData,
	MemberInvitedData,
	MemberLeftData,
	MemberKickedData,
	ChatNameChangedData,
	MessagePinnedData
} from '../../../../model/types/chat.types/chat.types';
import { Text, TextColor, TextSize, TextTag, TextType } from '@/shared/ui/Text';

import cls from './SystemMessages.module.scss';

interface SystemMessageProps {
	message: SystemMessageData;
	className?: string;
}

const HighlightText: React.FC<{ children: React.ReactNode }> = ({
	children
}) => (
	<Text
		type={TextType.TEXT}
		tag={TextTag.SPAN}
		fontSize={TextSize.XS}
		color={TextColor.WHITE}
		className={cls.highlight}
	>
		{children}
	</Text>
);

export const SystemMessage: React.FC<SystemMessageProps> = ({
	message,
	className = ''
}) => {
	const renderSystemMessage = () => {
		const { eventType, eventData } = message;

		switch (eventType) {
			case SystemEventType.CHAT_CREATED:
				return renderChatCreated(eventData.payload as ChatCreatedData);
			case SystemEventType.CHANNEL_CREATED:
				return renderChannelCreated(eventData.payload as ChatCreatedData);
			case SystemEventType.MEMBER_JOINED:
				return renderMemberJoined(eventData.payload as MemberJoinedData);
			case SystemEventType.MEMBER_INVITED:
				return renderMemberInvited(eventData.payload as MemberInvitedData);
			case SystemEventType.MEMBER_LEFT:
				return renderMemberLeft(eventData.payload as MemberLeftData);
			case SystemEventType.MEMBER_KICKED:
				return renderMemberKicked(eventData.payload as MemberKickedData);
			case SystemEventType.CHAT_NAME_CHANGED:
				return renderChatNameChanged(eventData.payload as ChatNameChangedData);
			case SystemEventType.MESSAGE_PINNED:
				return renderMessagePinned(eventData.payload as MessagePinnedData);
			default:
				return null;
		}
	};

	const renderChatCreated = (data: ChatCreatedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.ownerFullName}</HighlightText> создал группу «
			{data.name}»
		</span>
	);

	const renderChannelCreated = (data: ChatCreatedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.ownerFullName}</HighlightText> создал канал «
			{data.name}»
		</span>
	);

	const renderMemberJoined = (data: MemberJoinedData) => {
		if (data.joinType === 'invited' && data.inviterName) {
			return (
				<span className={cls.messageWrapper}>
					<HighlightText>{data.inviterName}</HighlightText> пригласил(а) в
					группу <HighlightText>{data.userName}</HighlightText>
				</span>
			);
		}
		return (
			<span className={cls.messageWrapper}>
				<HighlightText>{data.userName}</HighlightText> присоединяется к группе
			</span>
		);
	};

	const renderMemberInvited = (data: MemberInvitedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.inviterName}</HighlightText> пригласил(а) в группу{' '}
			<HighlightText>{data.invitedUserName}</HighlightText>
		</span>
	);

	const renderMemberLeft = (data: MemberLeftData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.userName}</HighlightText> покинул(а) группу
		</span>
	);

	const renderMemberKicked = (data: MemberKickedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.kickerName}</HighlightText> удалил(а) из группы{' '}
			<HighlightText>{data.userName}</HighlightText>
		</span>
	);

	const renderChatNameChanged = (data: ChatNameChangedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.changedByUserName}</HighlightText> изменил(а)
			название чата с «{data.oldName}» на «{data.newName}»
		</span>
	);

	const renderMessagePinned = (data: MessagePinnedData) => (
		<span className={cls.messageWrapper}>
			<HighlightText>{data.pinnedByUserName}</HighlightText> закрепил(а)
			сообщение
		</span>
	);

	return (
		<div className={`${cls.systemMessage} ${className}`}>
			<HighlightText>{renderSystemMessage()}</HighlightText>
		</div>
	);
};

export default SystemMessage;
