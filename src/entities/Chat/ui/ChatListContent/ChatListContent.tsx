import { memo, useCallback, useState } from 'react';
import { Chat } from '../../model/types/chat.types/chat.types';
import { ChatListItem } from '../ChatListItem/ChatListItem';

import {
	AddContactByPhoneRequest,
	useAddContactByPhoneMutation,
	useLazySearchGlobalContactsQuery
} from '@/entities/Contacts';
import { ContextMenu, useContextMenu } from '@/features/contextMenu';
import { Button, ButtonSize, ButtonTheme } from '@/shared/ui/Button';
import { KebabMenuItem } from '@/shared/ui/KebabMenu';
import { Modal } from '@/shared/ui/Modal';
import { Text, TextColor, TextSize, TextType } from '@/shared/ui/Text';
import {
	AddContact,
	MessageRead,
	Pin,
	Trash,
	UnPin,
	VolumeOff,
	VolumeOn
} from '@icons/index';
import {
	useDeleteChatMutation,
	useUpdateChatPropertiesMutation
} from '../../api/chatApi';
import cls from './ChatListContent.module.scss';

// Вспомогательный компонент для рендера элемента списка
export const ChatListContent = memo(
	({
		chats,
		selectedChatUid
	}: {
		chats: Chat[];
		selectedChatUid?: string | null;
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const [chatToDelete, setChatToDelete] = useState<{
			id: number;
			name: string;
		} | null>(null);

		// импорт хуков
		const [deleteChat, { isLoading, error }] = useDeleteChatMutation();
		const [addContact] = useAddContactByPhoneMutation();
		const [getContact] = useLazySearchGlobalContactsQuery();
		const [updateChatProperties] = useUpdateChatPropertiesMutation();

		const handleDelete = useCallback(async () => {
			if (chatToDelete) {
				try {
					await deleteChat(chatToDelete.id).unwrap();
					setIsOpen(false);
					setChatToDelete(null);
				} catch {}
			}
		}, [chatToDelete, deleteChat]);

		const getContextItems = useCallback(
			(chat: Chat): KebabMenuItem[] => {
				return [
					// из-за отсутствия номера телефона в чатах, надо делать костыль и доп запрос
					{
						text: 'Добавить в контакты',
						icon: <AddContact />,
						onClick: async () => {
							try {
								if (chat.chat.nickname) {
									const getContactResult = await getContact([
										{ phone_or_nickname: chat.chat.nickname }
									]);

									if (getContactResult.data?.results[0].phone) {
										const body: AddContactByPhoneRequest = {
											phone: getContactResult.data?.results[0].phone,
											first_name: chat.chat.first_name,
											last_name: chat.chat.last_name
										};
										await addContact(body).unwrap();
									}
								}
							} catch {}
						}
					},
					{
						text: chat.notifications
							? 'Выключить уведомления'
							: 'Включить уведомления',
						icon: chat.notifications ? <VolumeOff /> : <VolumeOn />,
						onClick: async () => {
							try {
								// Переключаем notifications
								await updateChatProperties({
									id: chat.id,
									notifications: !chat.notifications
								}).unwrap();
							} catch {}
						}
					},
					{
						text: chat.is_favorite ? 'Открепить' : 'Закрепить',
						icon: chat.is_favorite ? <UnPin /> : <Pin />,
						onClick: async () => {
							try {
								// Переключаем is_favorite
								await updateChatProperties({
									id: chat.id,
									is_favorite: !chat.is_favorite
								}).unwrap();
							} catch {}
						}
					},
					{
						text: 'Пометить прочитанным',
						icon: <MessageRead />,
						onClick: () => {
							console.log('read', chat.id);
						}
					},
					{
						text: 'Удалить чат',
						icon: <Trash />,
						onClick: async () => {
							setChatToDelete({
								id: chat.id,
								name: `${chat.chat.first_name} ${chat.chat.last_name}`
							});
							setIsOpen(true);
						},
						danger: true
					}
				];
			},
			[getContact, addContact, updateChatProperties]
		);

		const { handleContextMenu, isVisible, position, items } = useContextMenu();

		return (
			<>
				<div className={cls.list} role='listbox' aria-multiselectable='false'>
					{chats.map(chat => (
						<ChatListItem
							key={`${chat.id}-${chat.notifications}-${chat.is_favorite}`}
							chat={chat}
							isActive={selectedChatUid === chat.chat.uid}
							onContextMenu={e => handleContextMenu(e, getContextItems(chat))}
						/>
					))}
				</div>

				<ContextMenu visible={isVisible} position={position} items={items} />

				<Modal
					isOpen={isOpen}
					onClose={() => {
						setIsOpen(false);
						setChatToDelete(null);
					}}
					size='wide'
					className={cls.modal}
				>
					<Text
						type={TextType.TITLE}
						fontSize={TextSize.L}
						className={cls.modalTitle}
					>
						Удалить чат
					</Text>

					<Text fontSize={TextSize.M} className={cls.modalText}>
						Удалить чат с {chatToDelete?.name} без возможности восстановления?
					</Text>

					{error && (
						<Text color={TextColor.ERROR} className={cls.modalError}>
							Произошла ошибка при попытке удалить чат
						</Text>
					)}

					<Modal.Actions>
						<Button
							onClick={() => {
								setIsOpen(false);
								setChatToDelete(null);
							}}
							size={ButtonSize.S}
							theme={ButtonTheme.CLEAR}
						>
							Отмена
						</Button>

						<Button
							onClick={handleDelete}
							size={ButtonSize.S}
							disabled={isLoading}
						>
							{isLoading ? 'Удаление...' : 'Удалить'}
						</Button>
					</Modal.Actions>
				</Modal>
			</>
		);
	}
);
ChatListContent.displayName = 'ChatListContent';
