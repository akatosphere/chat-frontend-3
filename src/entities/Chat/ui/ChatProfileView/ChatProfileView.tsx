'use client';

import { useEffect, useRef, useState } from 'react';

import {
	useGetContactByUidQuery,
	useGetMessagesQuery,
	useGetFilesQuery,
	useGetLinksQuery,
	useGetChatsQuery,
	useUpdateChatPropertiesMutation,
	useAddContactByPhoneMutation,
	useUnblockUserMutation,
	useBlockUserMutation,
	useClearChatMutation,
	useGetMessengerListQuery
} from '../../api/chatApi/chatApi';
import { formatDateRu } from './lib/formatDateRu';

import {
	ChatFileItem,
	ChatLinkItem,
	ChatMediaItem,
	ChatNotificationsState,
	ChatVoiceItem,
	MessageWithAttachments
} from './model/ChatProfile.type';

import { ChatProfileAttachs } from './ChatProfileAttachs';
import { Text, TextColor } from '@/shared/ui/Text';
import { KebabMenu, KebabMenuItem } from '@/shared/ui/KebabMenu';
import {
	ActionAdd,
	Check,
	Close,
	CopyMessage,
	MenuIcon,
	Send,
	Clear,
	Block
} from '@icons/index';

import s from './ChatProfileView.module.scss';

interface ChatProfileViewProps {
	userUid: string;
	onBack: () => void;
}

export const ChatProfileView = ({ userUid, onBack }: ChatProfileViewProps) => {
	const { data: contact, isLoading } = useGetContactByUidQuery(userUid);

	const { data: chatsData } = useGetChatsQuery();

	const chat = userUid
		? chatsData?.results?.find(
				c => c.chat?.uid === userUid || c.chat_key === userUid
			)
		: undefined;

	const chatIdRef = useRef<number | null>(null);
	const notificationsRef = useRef<boolean>(false);

	useEffect(() => {
		if (chat?.id) {
			chatIdRef.current = chat.id;
		}

		if (typeof chat?.notifications === 'boolean') {
			notificationsRef.current = chat.notifications;
		}
	}, [chat?.id, chat?.notifications]);

	const notificationsState: ChatNotificationsState = {
		enabled: chat?.notifications ?? notificationsRef.current
	};
	const notificationsOn = notificationsState.enabled;

	const { data: messages } = useGetMessagesQuery(
		{ user_uid: userUid },
		{ skip: !userUid }
	);
	const { data: filesResponse } = useGetFilesQuery(
		{ user_uid: userUid },
		{ skip: !userUid }
	);
	const { data: linksResponse } = useGetLinksQuery(
		{ user_uid: userUid },
		{ skip: !userUid }
	);
	const { data: contacts } = useGetMessengerListQuery();

	const [updateChatProperties] = useUpdateChatPropertiesMutation();
	const [addContactByPhone] = useAddContactByPhoneMutation();
	const [unblockUser] = useUnblockUserMutation();
	const [blockUser] = useBlockUserMutation();
	const [clearChat] = useClearChatMutation();

	const [isKebabMenuOpen, setIsKebabMenuOpen] = useState(false);
	const [copiedId, setCopiedId] = useState<number | null>(null);

	const isInContacts = contacts?.results?.some(
		c => c.system_contact?.uid === userUid
	);

	const copyToClipboard = async (text: string, label?: string) => {
		if (!text) {
			return;
		}

		try {
			await navigator.clipboard.writeText(text);
			console.log(`Скопировано: ${label || text}`);
		} catch (err) {
			console.error('Не удалось скопировать:', err);
		}
	};

	const handleCopy = async (value: string, label: string, index: number) => {
		await copyToClipboard(value, label);
		setCopiedId(index);

		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleToggleNotifications = async () => {
		const chatId = chatIdRef.current;

		if (!chatId) {
			console.warn('ID чата не найден - уведомления нельзя переключить');
			return;
		}

		const nextNotifications = !notificationsRef.current;

		try {
			notificationsRef.current = nextNotifications;

			await updateChatProperties({
				id: chatId,
				notifications: nextNotifications
			}).unwrap();
		} catch (error) {
			notificationsRef.current = !nextNotifications;
			console.error('Не удалось обновить уведомления:', error);
		}
	};

	const handleAddToContacts = async () => {
		if (!contact?.username || !contact?.first_name || !contact?.last_name) {
			console.warn('Недостаточно данных для добавления в контакты');
			return;
		}

		try {
			await addContactByPhone({
				phone: contact.username,
				first_name: contact.first_name,
				last_name: contact.last_name
			}).unwrap();

			console.log('Пользователь успешно добавлен в контакты');
		} catch (error) {
			console.error(
				`Не удалось добавить в контакты (${contact.username})`,
				error
			);
		}
	};

	const handleUnblock = async () => {
		try {
			await unblockUser(userUid).unwrap();
			console.log('Пользователь успешно разблокирован');
		} catch (error) {
			console.error('Не удалось разблокировать пользователя', error);
		}
	};

	const handleBlock = async () => {
		try {
			console.log('Начинаем блокировку пользователя:', userUid);
			await blockUser(userUid).unwrap();
			console.log('Пользователь успешно заблокирован');
		} catch (error) {
			console.error('Ошибка при блокировке:', error);
		}
	};

	const handleClearChat = async () => {
		const chatId = chatIdRef.current;

		if (!chatId) {
			console.error('ID чата не найден');
			return;
		}

		try {
			await clearChat(chatId).unwrap();
			console.log('Чат успешно очищен');
		} catch (error) {
			console.error('Не удалось очистить чат:', error);
		}
	};

	const kebabMenuItems: KebabMenuItem[] = [
		{
			text: 'Поделиться профилем',
			icon: <Send />,
			onClick: () => {
				setIsKebabMenuOpen(false);
			}
		},
		{
			text: 'Очистить чат',
			icon: <Clear />,
			onClick: () => {
				handleClearChat();
				setIsKebabMenuOpen(false);
			}
		},
		{
			text: 'Заблокировать',
			icon: <Block />,
			danger: true,
			onClick: () => {
				handleBlock();
				setIsKebabMenuOpen(false);
			}
		}
	];

	const mediaItems: ChatMediaItem[] =
		messages?.results
			.flatMap(m => (m as MessageWithAttachments).attachments ?? [])
			.filter(a => a.type === 'image' || a.type === 'video')
			.map(a => ({
				id: a.id,
				url: a.url,
				type: a.type as 'image' | 'video',
				createdAt: a.created_at
			})) ?? [];

	const fileItems: ChatFileItem[] =
		filesResponse?.results.map(f => ({
			uid: f.uid,
			name: f.download_name,
			url: f.file_url,
			type: f.file_type,
			size: f.size,
			createdAt: f.created_at
		})) ?? [];

	const linkItems: ChatLinkItem[] =
		linksResponse?.results.map(l => ({
			url: l.url,
			title: l.title,
			from_user: {
				first_name: l.from_user.first_name,
				last_name: l.from_user.last_name
			},
			message_id: l.message_id,
			forwarded_in: l.forwarded_in.map(f => ({
				id: f.id,
				uid: f.uid,
				from_user: {
					first_name: f.from_user.first_name,
					last_name: f.from_user.last_name
				}
			})),
			created_at: l.created_at,
			updated_at: l.updated_at
		})) ?? [];

	const voiceItems: ChatVoiceItem[] =
		filesResponse?.results
			.filter(f => f.media_kind === 'audio' || f.file_type?.includes('audio'))
			.map(f => ({
				uid: f.uid,
				url: f.file_url,
				createdAt: f.created_at
			})) ?? [];

	if (isLoading) {
		return (
			<div className={s.emptyState}>
				<Text color={TextColor.GRAY}>Загружаем данные пользователя...</Text>
			</div>
		);
	}

	if (!contact) {
		return (
			<div className={s.emptyState}>
				<Text color={TextColor.ERROR}>Ошибка загрузки пользователя</Text>
			</div>
		);
	}

	const was_online_at = contact.was_online_at;
	const status = contact.is_online
		? 'в сети'
		: was_online_at
			? `был(а) ${new Date(was_online_at * 1000).toLocaleTimeString('ru-RU', {
					hour: '2-digit',
					minute: '2-digit'
				})}`
			: 'не в сети';

	const birthday = formatDateRu(contact.birthday);

	const rows = [
		{
			label: 'Никнейм',
			value: `@${contact.nickname}`,
			type: 'primary' as const
		},
		{
			label: 'Номер телефона',
			value: contact.username,
			type: 'primary' as const
		},
		{ label: 'День рождения', value: birthday, type: 'default' as const },
		{
			label: 'О себе',
			value: contact.additional_information,
			type: 'default' as const
		}
	];

	return (
		<div className={s.container}>
			<div className={s.header}>
				<div className={s.headerLeft}>
					<button onClick={onBack}>
						<Close className={s.closeIcon} />
					</button>
					<p className={s.title}>Информация</p>
				</div>

				<button
					className={s.menuButton}
					onClick={() => setIsKebabMenuOpen(prev => !prev)}
					aria-label='Открыть меню'
				>
					<MenuIcon className={s.menuIcon} />
				</button>
			</div>

			{isKebabMenuOpen && (
				<KebabMenu
					visible={isKebabMenuOpen}
					items={kebabMenuItems}
					onClose={() => setIsKebabMenuOpen(false)}
					className={s.kebabMenu}
				/>
			)}

			<div
				className={s.profile}
				style={{
					backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 50%), ${contact.avatar_url ? `url(${contact.avatar_url})` : `url(/images/png/NoAvatarAvatar.png)`}`
				}}
			>
				<p className={s.name}>
					{contact.first_name} {contact.last_name}
				</p>
				<p className={s.status}>{status}</p>
			</div>

			<div className={s.notifications}>
				<p>Уведомления</p>
				<button
					onClick={handleToggleNotifications}
					className={s.toggleButton}
					aria-label='Переключить уведомления'
				>
					<svg width='60' height='48' viewBox='0 0 60 48' fill='none'>
						<rect
							y='8'
							width='52'
							height='32'
							rx='16'
							fill={notificationsOn ? '#7769E1' : '#b3b3b3'}
						/>
						<rect
							x={notificationsOn ? '24' : '4'}
							y='12'
							width='24'
							height='24'
							rx='12'
							fill='white'
						/>
					</svg>
				</button>
			</div>

			<div className={s.card}>
				{rows.map(
					(item, i) =>
						item.value && (
							<div key={i} className={s.row}>
								<div className={s.rowText}>
									<p className={s.label}>{item.label}</p>
									<p
										className={
											item.type === 'primary' ? s.valuePrimary : s.valueDefault
										}
									>
										{item.value}
									</p>
								</div>
								{item.type === 'primary' && (
									<button
										className={copiedId === i ? s.checkIcon : s.copyIcon}
										onClick={() => handleCopy(item.value, item.label, i)}
										title={`Копировать ${item.label.toLowerCase()}`}
										aria-label={`Копировать ${item.label}`}
									>
										{copiedId === i ? <Check /> : <CopyMessage />}
									</button>
								)}
							</div>
						)
				)}
			</div>

			{!isInContacts && (
				<button className={s.action} onClick={handleAddToContacts}>
					<ActionAdd />
					<span>Добавить в контакты</span>
				</button>
			)}

			{contact.is_blocked && (
				<button className={s.action} onClick={handleUnblock}>
					<ActionAdd />
					<span>Разблокировать</span>
				</button>
			)}

			<ChatProfileAttachs
				mediaItems={mediaItems}
				fileItems={fileItems}
				voiceItems={voiceItems}
				linkItems={linkItems}
			/>
		</div>
	);
};
