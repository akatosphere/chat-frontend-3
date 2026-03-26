import { memo } from 'react';
import { Text, TextSize, TextTag, TextType, TextColor } from '@/shared/ui/Text';
import { Button, ButtonTheme } from '@/shared/ui/Button';
import { Trash } from '@icons/index';

import cls from './ContactsHeader.module.scss';

export interface ContactsHeaderProps {
	mobile: boolean;
	isSelectionMode: boolean;
	selectedCount: number;
	onEnterSelectionMode: () => void;
}

export const ContactsHeader = memo(
	({
		mobile,
		isSelectionMode,
		selectedCount,
		onEnterSelectionMode
	}: ContactsHeaderProps) => {
		return (
			<div className={cls.contactsTrash}>
				{mobile ? (
					<>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.S}
							color={TextColor.BLACK}
						>
							Мои контакты
						</Text>

						<Button
							theme={ButtonTheme.CLEAR}
							onClick={onEnterSelectionMode}
							aria-label='Режим выбора контактов'
							className={cls.trashBtn}
							disabled={isSelectionMode && selectedCount > 0}
						>
							{isSelectionMode && mobile ? 'Выбрано' : 'Выбрать'}
						</Button>
					</>
				) : (
					<>
						<Text
							type={TextType.TEXT}
							tag={TextTag.SPAN}
							fontSize={TextSize.S}
							color={TextColor.BLACK}
						>
							Контакты пользователей А-чата
						</Text>
						<Button
							theme={ButtonTheme.CLEAR}
							onClick={onEnterSelectionMode}
							aria-label='Режим выбора контактов'
							className={cls.trashBtn}
						>
							<Trash className={cls.trashBtnIcon} aria-hidden='true' />
						</Button>
					</>
				)}
			</div>
		);
	}
);

ContactsHeader.displayName = 'ContactsHeader';
