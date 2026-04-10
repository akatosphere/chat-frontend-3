'use client';

import {
	Button,
	ButtonColor,
	ButtonTheme,
	ButtonType
} from '@/shared/ui/Button';
import { SearchIcon, Phone, Back, Success, MobilePhone } from '@icons/index';
import { Search } from '@/shared/ui/Search';
import { Avatar } from '@/shared/ui/Avatar';
import {
	Text,
	TextSize,
	TextTag,
	TextType,
	TitleTag,
	TextColor
} from '@/shared/ui/Text';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { Modal } from '@/shared/ui/Modal';
import { ChatActionBar } from '../ChatActionBar/ChatActionBar';
import { ChatHeaderProps } from '../../model/types/chat.types/chat.types';
import { useChatHeader } from '../../model/lib/hooks/useChatHeader/useChatHeader';

import cls from './ChatHeader.module.scss';

export const ChatHeader = (props: ChatHeaderProps) => {
	const isMobile = useMediaQuery();

	const {
		searchRef,
		isActionBarVisible,
		isSuccessModalOpen,
		handleAddToContacts,
		handleBlock,
		handleActionBarClose,
		handleSearchToggle,
		handleSearchClear
	} = useChatHeader(props);

	const {
		userName = 'Неизвестный пользователь',
		userStatus = 'Статус неизвестен',
		userAvatar,
		isSearchVisible = false,
		searchQuery = '',
		searchResultsCount = 0,
		activeResultIndex = 0,
		onBack
	} = props;

	const canGoPrev = (activeResultIndex ?? 0) > 0;
	const canGoNext = (activeResultIndex ?? 0) < (searchResultsCount ?? 0) - 1;

	return (
		<>
			<header className={cls.chatHeader}>
				<div className={cls.leftSection}>
					{isMobile && onBack && (
						<Button
							theme={ButtonTheme.CIRCLE}
							color={ButtonColor.TRANSPARENT}
							btnType={ButtonType.BUTTON}
							onClick={onBack}
							className={cls.backButton}
							aria-label='Назад к списку чатов'
						>
							<Back />
						</Button>
					)}

					<div className={cls.userInfo}>
						<div className={cls.userAvatar}>
							<Avatar
								src={userAvatar}
								alt={userName}
								variant='card'
								size={40}
							/>
						</div>

						{!isSearchVisible && (
							<div className={cls.userDetails}>
								<Text
									type={TextType.TITLE}
									tag={TitleTag.H3}
									fontSize={TextSize.L}
									className={cls.userNameText}
								>
									{userName}
								</Text>
								<Text
									type={TextType.TEXT}
									tag={TextTag.P}
									fontSize={TextSize.S}
									className={cls.userStatusText}
								>
									{userStatus}
								</Text>
							</div>
						)}
					</div>

					{isSearchVisible && (
						<div
							ref={searchRef}
							className={cls.searchContainer}
							id='chat-search-panel'
							role='search'
						>
							<Search
								value={searchQuery}
								onChange={props.onSearchQueryChange || (() => {})}
								onClear={handleSearchClear}
								placeholder='Поиск в чате...'
								alwaysShowClear
								showIcon
								autoFocus
								className={cls.searchInput}
								showNavigation
								onNavigatePrev={props.navigateToPrev}
								onNavigateNext={props.navigateToNext}
								searchResultsCount={searchResultsCount}
								activeResultIndex={activeResultIndex}
								canGoPrev={canGoPrev}
								canGoNext={canGoNext}
							/>
						</div>
					)}
				</div>

				{!isSearchVisible && (
					<div className={cls.actions}>
						{!isMobile && (
							<Button
								btnType={ButtonType.BUTTON}
								color={ButtonColor.TRANSPARENT}
								theme={ButtonTheme.CIRCLE}
								onClick={handleSearchToggle}
								aria-label='Поиск сообщений'
								aria-expanded={isSearchVisible}
								className={cls.btn}
							>
								<SearchIcon className={cls.icon} aria-hidden />
							</Button>
						)}

						<Button
							btnType={ButtonType.BUTTON}
							color={ButtonColor.TRANSPARENT}
							theme={ButtonTheme.CIRCLE}
							onClick={props.onCall}
							aria-label='Начать звонок'
							className={cls.btn}
						>
							{isMobile ? (
								<MobilePhone aria-hidden className={cls.icon} />
							) : (
								<Phone aria-hidden className={cls.icon} />
							)}
						</Button>
					</div>
				)}
			</header>

			{isSearchVisible && searchQuery.trim() && searchResultsCount > 0 && (
				<div
					className={cls.searchResultsPanel}
					role='status'
					aria-live='polite'
				>
					<Text type={TextType.TEXT} tag={TextTag.SPAN} fontSize={TextSize.S}>
						Результаты: {activeResultIndex + 1} из {searchResultsCount}
					</Text>
				</div>
			)}

			{isActionBarVisible && (
				<div className={cls.actionBarContainer}>
					<ChatActionBar
						onAddToContacts={handleAddToContacts}
						onBlock={handleBlock}
						onClose={handleActionBarClose}
						isLoading={false}
					/>
				</div>
			)}

			<Modal
				isOpen={isSuccessModalOpen}
				onClose={() => {}}
				closeButton={false}
				size='compact'
				className={cls.successModal}
			>
				<div className={cls.successModalContent}>
					<Success className={cls.successIcon} aria-hidden />
					<div className={cls.modalInfo}>
						<Text
							type={TextType.TITLE}
							tag={TitleTag.H3}
							fontSize={TextSize.L}
							className={cls.userNameText}
						>
							{userName}
						</Text>
						<Text
							type={TextType.TEXT}
							tag={TextTag.P}
							fontSize={TextSize.S}
							color={TextColor.BLACK}
							className={cls.successText}
						>
							теперь в списке ваших контактов
						</Text>
					</div>
				</div>
			</Modal>
		</>
	);
};
