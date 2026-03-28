'use client';

import React from 'react';
import { formatDateSeparator } from '@/entities/Chat/model/lib/service/dateFormating/dateFormater';
import { Text, TextColor, TextSize, TextTag, TextType } from '@/shared/ui/Text';
import cls from './StickyDateHeader.module.scss';

interface StickyDateHeaderProps {
	date: Date | null;
	isVisible?: boolean;
	className?: string;
}

const StickyDateHeader: React.FC<StickyDateHeaderProps> = ({
	date,
	isVisible = false,
	className = ''
}) => {
	const label = date ? formatDateSeparator(date) : '';
	if (!date) {
		return null;
	}
	return (
		<div
			className={`${cls.stickyHeader} ${className} ${isVisible ? cls.visible : cls.hidden}`}
			data-active-date={date.toISOString()}
		>
			<span className={cls.headerContent}>
				<Text
					type={TextType.TEXT}
					tag={TextTag.SPAN}
					fontSize={TextSize.XS}
					color={TextColor.WHITE}
				>
					{label}
				</Text>
			</span>
		</div>
	);
};

export default StickyDateHeader;
