import { classNames } from '@/shared/lib/classNames/classNames';
import { useEffect, useRef } from 'react';
import { KebabMenuItem } from '../model/types/type';
import cls from './KebabMenu.module.scss';

interface KebabMenuProps {
	className?: string;
	visible: boolean;
	items: KebabMenuItem[];
	onClose?: () => void;
}

export const KebabMenu = ({
	className,
	visible,
	items,
	onClose
}: KebabMenuProps) => {
	const menuRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (!event.target) {
				return;
			}

			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				onClose
			) {
				onClose();
			}
		};

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside, {
			passive: true
		});

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [visible, onClose]);

	if (!visible) {
		return;
	}

	return (
		<ul
			role='menu'
			tabIndex={-1}
			ref={menuRef}
			className={classNames(cls.KebabMenuList, {}, [className])}
		>
			{items.map(item => (
				<li
					role='menuitem'
					tabIndex={0}
					key={item.text}
					className={classNames(cls.kebabMenuItem, {
						[cls.danger]: item.danger
					})}
					onClick={() => {
						item.onClick();
						onClose?.();
					}}
				>
					<div className={cls.kebabMenuItemText}>{item.text}</div>
					<div className={cls.kebabMenuItemIcon}>{item.icon}</div>
				</li>
			))}
		</ul>
	);
};
