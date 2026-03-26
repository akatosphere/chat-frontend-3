import { memo } from 'react';
import { Text, TextSize, TextTag, TextType, TextColor } from '@/shared/ui/Text';
import { Button, ButtonTheme, ButtonColor } from '@/shared/ui/Button';
import { Trash, Send, Close } from '@icons/index';
import { getContactWordForm } from '@/entities/Contacts/model/lib/services/getContactWordForm/getContactWordForm';

import cls from './SelectionFooter.module.scss';

export interface SelectionFooterProps {
	mobile: boolean;
	selectedCount: number;
	onClose: () => void;
	onShare: () => void;
	onDelete: () => void;
}

export const SelectionFooter = memo(
	({
		mobile,
		selectedCount,
		onClose,
		onShare,
		onDelete
	}: SelectionFooterProps) => {
		return (
			<footer className={cls.selectionFooter}>
				{!mobile && (
					<Button
						onClick={onDelete}
						theme={ButtonTheme.CLEAR}
						className={cls.delBtn}
					>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.M}
							color={TextColor.ERROR}
							className={cls.footerText}
						>
							Удалить {selectedCount} {getContactWordForm(selectedCount)}
						</Text>
					</Button>
				)}

				{mobile && (
					<>
						<Button
							theme={ButtonTheme.CLEAR}
							color={ButtonColor.TRANSPARENT}
							className={cls.closeFooterBtn}
							onClick={onClose}
							aria-label='Закрыть панель выбора'
						>
							<Close className={cls.closeIcon} aria-hidden='true' />
						</Button>

						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.M}
							color={TextColor.BLACK}
							className={cls.footerCount}
						>
							{selectedCount === 1 ? 'Выбран' : 'Выбрано'} {selectedCount}{' '}
							{getContactWordForm(selectedCount)}
						</Text>

						<div className={cls.footerActions}>
							<Button
								theme={ButtonTheme.CLEAR}
								color={ButtonColor.TRANSPARENT}
								className={cls.shareBtn}
								onClick={onShare}
								aria-label='Поделиться контактами'
							>
								<Send className={cls.shareIcon} aria-hidden='true' />
							</Button>

							<Button
								theme={ButtonTheme.CLEAR}
								color={ButtonColor.TRANSPARENT}
								className={cls.footerTrashBtn}
								onClick={onDelete}
								aria-label='Удалить выбранные контакты'
							>
								<Trash className={cls.footerTrashIcon} aria-hidden='true' />
							</Button>
						</div>
					</>
				)}
			</footer>
		);
	}
);

SelectionFooter.displayName = 'SelectionFooter';
