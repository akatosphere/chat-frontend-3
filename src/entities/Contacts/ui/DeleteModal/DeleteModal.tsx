import { memo } from 'react';
import { Modal } from '@/shared/ui/Modal';
import {
	Text,
	TextSize,
	TextTag,
	TextType,
	TextColor,
	TitleTag
} from '@/shared/ui/Text';
import {
	Button,
	ButtonTheme,
	ButtonColor,
	ButtonSize
} from '@/shared/ui/Button';
import { getSelAdjForm } from '@/entities/Contacts/model/lib/services/getSelAdjForm/getSelAdjForm';

import cls from './DeleteModal.module.scss';

export interface DeleteModalProps {
	isOpen: boolean;
	selectedCount: number;
	onClose: () => void;
	onConfirm: () => void;
	getContactWordForm: (count: number) => string;
}

export const DeleteModal = memo(
	({
		isOpen,
		selectedCount,
		onClose,
		onConfirm,
		getContactWordForm
	}: DeleteModalProps) => {
		return (
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				closeButton={false}
				size='wide'
				className={cls.deleteModal}
				aria-labelledby='delete-modal-title'
			>
				<div className={cls.modalContent}>
					<div className={cls.modalInfo}>
						<Text
							type={TextType.TITLE}
							tag={TitleTag.H3}
							fontSize={TextSize.L}
							className={cls.modalTitle}
						>
							Удалить контакты
						</Text>
						<Text
							type={TextType.TEXT}
							tag={TextTag.P}
							fontSize={TextSize.S}
							color={TextColor.GRAY}
							className={cls.modalText}
						>
							Вы уверены, что хотите удалить {selectedCount}{' '}
							{getSelAdjForm(selectedCount)} {getContactWordForm(selectedCount)}
							?
						</Text>
					</div>

					<div className={cls.modalActions}>
						<Button
							theme={ButtonTheme.CLEAR}
							color={ButtonColor.TRANSPARENT}
							size={ButtonSize.S}
							className={cls.modalCancel}
							onClick={onClose}
						>
							<Text
								type={TextType.TEXT}
								tag={TextTag.P}
								fontSize={TextSize.S}
								color={TextColor.ACCENT}
							>
								Отмена
							</Text>
						</Button>

						<Button
							color={ButtonColor.PRIMARY}
							className={cls.modalDelete}
							size={ButtonSize.S}
							onClick={onConfirm}
						>
							Удалить
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
);

DeleteModal.displayName = 'DeleteModal';
