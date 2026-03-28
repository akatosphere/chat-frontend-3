'use client';

import { classNames } from '@/shared/lib/classNames/classNames';
import { KebabMenu, KebabMenuItem } from '@/shared/ui/KebabMenu';
import cls from './ContextMenu.module.scss';

interface ContextMenuProps {
	className?: string;
	visible: boolean;
	items: KebabMenuItem[];
	position: {
		x: number;
		y: number;
	} | null;
}

export const ContextMenu = ({
	className,
	visible,
	items,
	position
}: ContextMenuProps) => {
	if (!visible || !position) {
		return null;
	}

	return (
		<div
			className={classNames(cls.ContextMenu, {}, [className])}
			style={{
				top: position?.y,
				left: position?.x
			}}
		>
			<KebabMenu visible={visible} items={items} />
		</div>
	);
};
