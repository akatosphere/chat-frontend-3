import Image from 'next/image';
import { formatUnixToLocalTime } from '@/shared/lib/formatUnixToLocalTime/formatUnixToLocalTime';
import { FontWeight, Text, TextColor, TextSize } from '@/shared/ui/Text';
import { MessageStatusNode } from './MessageStatusNode';
import { classNames } from '@/shared/lib/classNames/classNames';
import styles from './MessageBubble.module.scss';

interface MessageBubbleProps {
	id: string;
	time: number;
	text: string;
	status: 'received' | 'sending' | 'unread' | 'read';
	onClick: (id: string) => void;

	isGroupChat?: boolean;
	senderName?: string;
	senderAvatar?: string;

	isFirstInGroup?: boolean;
	isLastInGroup?: boolean;
}

export const MessageBubble = ({
	id,
	time,
	text,
	status,
	onClick,

	isGroupChat = false,
	senderName,
	senderAvatar,
	isFirstInGroup = false,
	isLastInGroup = false
}: MessageBubbleProps) => {
	const isGroupReceived = isGroupChat && status === 'received';
	const showName = isGroupReceived && senderName && isFirstInGroup;
	const showAvatar = isGroupReceived && senderAvatar && isLastInGroup;

	const handleActivate = () => {
		onClick(id);
	};

	const messageClass = classNames(styles.message, {
		[styles.message_sent]: status !== 'received',
		[styles.message_received]: status === 'received'
	});

	const avatarSlotClass = classNames(styles.messageAvatarSlot, {
		[styles.messageAvatarSlot_hidden]: !showAvatar
	});

	return (
		<div className={styles.messageWrapper}>
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
							{text}
						</Text>

						<div className={styles.message__meta}>
							<Text
								lineHeight={1.2}
								fontSize={TextSize.S}
								color={TextColor.GRAY}
								className={styles.message__time}
							>
								{formatUnixToLocalTime(time)}
							</Text>

							{status !== 'received' && <MessageStatusNode status={status} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
