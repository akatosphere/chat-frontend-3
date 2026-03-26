'use client';

import { memo, useCallback } from 'react';
import {
	Button,
	ButtonColor,
	ButtonTheme,
	ButtonType
} from '@/shared/ui/Button';
import { Close } from '@icons/index';
import { Text, TextSize, TextTag, TextType, TextColor } from '@/shared/ui/Text';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';

import cls from './ChatActionBar.module.scss';

export interface ChatActionBarProps {
	onAddToContacts?: () => void;
	onBlock?: () => void;
	onClose?: () => void;
	isLoading?: boolean;
}

export const ChatActionBar = memo(
	({
		onAddToContacts,
		onBlock,
		onClose,
		isLoading = false
	}: ChatActionBarProps) => {
		const isMobile = useMediaQuery();
		const handleAddToContacts = useCallback(() => {
			onAddToContacts?.();
		}, [onAddToContacts]);

		const handleBlock = useCallback(() => {
			onBlock?.();
		}, [onBlock]);

		const handleClose = useCallback(() => {
			onClose?.();
		}, [onClose]);

		return (
			<div
				className={cls.chatActionBar}
				role='toolbar'
				aria-label='Действия с чатом'
			>
				<div className={cls.actions}>
					<Button
						btnType={ButtonType.BUTTON}
						color={ButtonColor.PRIMARY}
						theme={ButtonTheme.CLEAR}
						onClick={handleAddToContacts}
						disabled={isLoading}
						className={cls.addButton}
						aria-label='Добавить в контакты'
					>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.M}
							color={TextColor.ACCENT}
							className={cls.addButtonText}
						>
							Добавить в контакты
						</Text>
					</Button>

					<Button
						btnType={ButtonType.BUTTON}
						color={ButtonColor.TRANSPARENT}
						theme={ButtonTheme.CLEAR}
						onClick={handleBlock}
						disabled={isLoading}
						className={cls.blockButton}
						aria-label='Заблокировать'
					>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							color={TextColor.ERROR}
							fontSize={TextSize.M}
							className={cls.blockButtonText}
						>
							Заблокировать
						</Text>
					</Button>
				</div>
				{isMobile ? (
					<Button
						btnType={ButtonType.BUTTON}
						color={ButtonColor.TRANSPARENT}
						theme={ButtonTheme.CLEAR}
						onClick={handleClose}
						disabled={isLoading}
						className={cls.closeButton}
						aria-label='Закрыть панель действий'
					>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							color={TextColor.GRAY}
						>
							Закрыть уведомление
						</Text>
					</Button>
				) : (
					<Button
						btnType={ButtonType.BUTTON}
						color={ButtonColor.TRANSPARENT}
						theme={ButtonTheme.CLEAR}
						onClick={handleClose}
						disabled={isLoading}
						className={cls.closeButton}
						aria-label='Закрыть панель действий'
					>
						<Close className={cls.closeIcon} aria-hidden='true' />
					</Button>
				)}
			</div>
		);
	}
);

ChatActionBar.displayName = 'ChatActionBar';
