'use client';

import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { formatUnixToLocalTime } from '@/shared/lib/formatUnixToLocalTime/formatUnixToLocalTime';
import { FontWeight, Text, TextColor, TextSize } from '@/shared/ui/Text';
import { MessageStatusNode } from './MessageStatusNode';
import { classNames } from '@/shared/lib/classNames/classNames';
import { highlightText } from '../../model/lib/service/highlightText/highlightText';
import { MessageStatus } from '../../model/types/chat.types/chat.types';

import styles from './MessageBubble.module.scss';

interface MessageBubbleProps {
	id: string;
	time: number;
	text: string;
	status: MessageStatus | 'received' | 'sending' | 'unread' | 'read';
	onClick: (id: string) => void;

	// пропсы для авто-прочтения
	isFromCurrentUser: boolean;
	isNew: boolean;

	// Групповые чаты
	isGroupChat?: boolean;
	senderName?: string;
	senderAvatar?: string;
	isFirstInGroup?: boolean;
	isLastInGroup?: boolean;

	// UI
	className?: string;
	'data-message-id'?: string;
	searchQuery?: string;
	activeResultId?: string;
	isLastInChat?: boolean;
	getActiveOccurrencesForMessage?: (messageId: string) => number[] | undefined;

	onContextMenu?: (e: React.MouseEvent) => void;
}

const MessageBubbleComponent = ({
	id,
	time,
	text,
	status,
	onClick,
	isFromCurrentUser,
	isNew,
	isGroupChat = false,
	senderName,
	senderAvatar,
	isFirstInGroup = false,
	isLastInGroup = false,
	className,
	'data-message-id': dataMessageId,
	searchQuery = '',
	activeResultId,
	isLastInChat = false,
	getActiveOccurrencesForMessage,
	onContextMenu
}: MessageBubbleProps) => {
	//
	const formattedTime = useMemo(() => formatUnixToLocalTime(time), [time]);

	const handleActivate = useCallback(() => onClick(id), [onClick, id]);

	const isGroupReceived = isGroupChat && status === 'received';
	const showName = isGroupReceived && senderName && isFirstInGroup;
	const showAvatar = isGroupReceived && senderAvatar && isLastInGroup;

	const messageClass = classNames(styles.message, {
		[styles.message_sent]: status !== 'received',
		[styles.message_received]: status === 'received'
	});

	const avatarSlotClass = classNames(styles.messageAvatarSlot, {
		[styles.messageAvatarSlot_hidden]: !showAvatar
	});

	return (
		<div
			className={classNames(
				styles.messageWrapper,
				{},
				[className].filter(Boolean)
			)}
			data-message-id={dataMessageId || id}
			data-is-from-current-user={isFromCurrentUser}
			data-is-new={isNew}
			data-is-last-message={isLastInChat}
			onContextMenu={onContextMenu}
		>
			<div className={styles.messageRow}>
				{isGroupReceived && (
					<div className={avatarSlotClass}>
						{showAvatar && (
							<Image
								src={senderAvatar!}
								alt={senderName ?? 'Пользователь'}
								width={32}
								height={32}
								className={styles.message__avatar}
							/>
						)}
					</div>
				)}

				<div
					className={messageClass}
					role='button'
					tabIndex={0}
					onClick={handleActivate}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleActivate();
						}
					}}
				>
					{showName && (
						<Text
							fontWeight={FontWeight.BOLD}
							fontSize={TextSize.S}
							color={TextColor.ACCENT}
							className={styles.message__sender}
						>
							{senderName}
						</Text>
					)}

					<div className={styles.message__content}>
						<Text
							lineHeight={1.3}
							color={TextColor.BLACK}
							className={styles.message__text}
						>
							{searchQuery
								? highlightText(text, {
										query: searchQuery,
										activeIndices:
											String(activeResultId) === String(id)
												? getActiveOccurrencesForMessage?.(String(id)) || []
												: [],
										baseClassName: styles.searchHighlight,
										activeClassName: styles.searchHighlight_active,
										caseSensitive: false
									})
								: text}
						</Text>

						<div className={styles.message__meta}>
							<Text
								lineHeight={1.2}
								fontSize={TextSize.S}
								color={TextColor.GRAY}
								className={styles.message__time}
							>
								{formattedTime}
							</Text>

							{status !== 'received' && (
								<MessageStatusNode
									status={status as MessageStatus}
									isOwn={isFromCurrentUser}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const MessageBubble = React.memo(MessageBubbleComponent);
