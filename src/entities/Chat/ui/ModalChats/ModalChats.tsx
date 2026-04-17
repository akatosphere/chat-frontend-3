import { classNames } from '@/shared/lib/classNames/classNames';
import { Modal } from '@/shared/ui/Modal';
import {
	filterChatsByNameExtended,
	Search,
	useLocalSearch
} from '@/shared/ui/Search';
import { Text, TextColor, TextSize } from '@/shared/ui/Text';
import {
	mapChatToUserCard,
	UserCard,
	UserCardType
} from '@/shared/ui/UserCard';
import { SearchClear } from '@icons/index';
import { useGetChatsQuery } from '../../api/chatApi';
import cls from './ModalChats.module.scss';

interface ModalChatsProps {
	onClick: (uid: string) => void;
	isOpen: boolean;
	onClose: () => void;
	className?: string;
}

export const ModalChats = ({
	onClick,
	isOpen,
	onClose,
	className
}: ModalChatsProps) => {
	const { data: chats, isLoading } = useGetChatsQuery();

	const { searchTerm, filteredData, handleSearchChange } = useLocalSearch(
		chats?.results ?? [],
		filterChatsByNameExtended,
		300
	);

	return (
		<Modal
			className={classNames(cls.modal, {}, [className])}
			isOpen={isOpen}
			onClose={onClose}
			size='regular'
			closeButton
		>
			<div className={cls.modalTitle}>Отправить</div>

			<div className={cls.searchWrapper}>
				<Search
					value={searchTerm}
					onChange={handleSearchChange}
					placeholder='Поиск'
				/>
			</div>

			<div className={cls.chatsWrapper}>
				{isLoading ? (
					<>Загрузка...</>
				) : searchTerm ? (
					filteredData.length === 0 ? (
						<div className={cls.searchClearWrapper}>
							<SearchClear className={cls.icon} />
							<Text
								color={TextColor.GRAY}
								fontSize={TextSize.L}
								className={cls.searchTitle}
							>
								Поиск не дал результатов
							</Text>
							<Text
								color={TextColor.GRAY}
								fontSize={TextSize.L}
								className={cls.searchText}
							>
								По вашему запросу ничего не найдено.
							</Text>
							<Text
								color={TextColor.GRAY}
								fontSize={TextSize.L}
								className={cls.searchTitle}
							>
								Измените запрос и попробуйте снова
							</Text>
						</div>
					) : (
						filteredData.map(chat => (
							<UserCard
								className={cls.userCard}
								userData={mapChatToUserCard(chat)}
								type={UserCardType.CONTACT}
								key={chat.chat.uid}
								onClick={() => onClick(chat.chat.uid)}
							/>
						))
					)
				) : !chats?.results?.length && filteredData.length === 0 ? (
					<>Список чатов пуст</>
				) : (
					filteredData.map(chat => (
						<UserCard
							className={cls.userCard}
							userData={mapChatToUserCard(chat)}
							type={UserCardType.CONTACT}
							key={chat.chat.uid}
							onClick={() => onClick(chat.chat.uid)}
						/>
					))
				)}
			</div>
		</Modal>
	);
};
