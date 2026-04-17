'use client';

import { memo, useCallback } from 'react';
import { Modal } from '@/shared/ui/Modal';
import {
	Button,
	ButtonSize,
	ButtonTheme,
	ButtonColor
} from '@/shared/ui/Button';
import {
	Text,
	TextSize,
	TextType,
	TextColor,
	TitleTag,
	TextTag
} from '@/shared/ui/Text';

import cls from './BlockUserModal.module.scss';

export interface BlockUserModalProps {
	isOpen: boolean;
	userFirstName?: string;
	userLastName?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export const BlockUserModal = memo(
	({
		isOpen,
		userFirstName = '',
		userLastName = '',
		onConfirm,
		onCancel,
		isLoading = false
	}: BlockUserModalProps) => {
		const handleClose = useCallback(() => {
			if (!isLoading) {
				onCancel();
			}
		}, [isLoading, onCancel]);

		const handleConfirm = useCallback(() => {
			if (!isLoading) {
				onConfirm();
			}
		}, [isLoading, onConfirm]);

		if (!isOpen) {
			return null;
		}

		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				size='wide'
				className={cls.blockUserModal}
			>
				<div className={cls.modalContent}>
					<div className={cls.modalInfo}>
						<Text
							type={TextType.TITLE}
							tag={TitleTag.H3}
							fontSize={TextSize.L}
							className={cls.modalTitle}
						>
							Заблокировать {userFirstName} {userLastName}
						</Text>

						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.M}
							className={cls.modalText}
							color={TextColor.GRAY}
						>
							Пользователь не сможет писать Вам личные сообщения, звонить и
							приглашать Вас в группы и каналы
						</Text>
					</div>

					<Modal.Actions className={cls.modalActions}>
						<Button
							onClick={handleConfirm}
							size={ButtonSize.S}
							color={ButtonColor.ERROR}
							disabled={isLoading}
							className={cls.confirmBtn}
						>
							{isLoading ? 'Блокировка...' : 'Заблокировать'}
						</Button>

						<Button
							onClick={handleClose}
							size={ButtonSize.S}
							theme={ButtonTheme.CLEAR}
							disabled={isLoading}
						>
							Отмена
						</Button>
					</Modal.Actions>
				</div>
			</Modal>
		);
	}
);

BlockUserModal.displayName = 'BlockUserModal';
