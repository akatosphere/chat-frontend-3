'use client';

import React, { forwardRef } from 'react';
import { formatDateSeparator } from '@/entities/Chat/model/lib/service/dateFormating/dateFormater';
import { Text, TextColor, TextSize, TextTag, TextType } from '@/shared/ui/Text';
import cls from './DateSeparator.module.scss';

interface DateSeparatorProps {
	date: Date;
	className?: string;
	isHidden?: boolean;
}

const DateSeparator = forwardRef<HTMLDivElement, DateSeparatorProps>(
	({ date, className = '', isHidden = false }, ref) => {
		const label = formatDateSeparator(date);

		const hiddenStyles: React.CSSProperties = isHidden
			? {
					opacity: 0,
					visibility: 'hidden',
					pointerEvents: 'none'
				}
			: {};

		return (
			<div
				ref={ref}
				className={`${cls.dateSeparator} ${className}`}
				data-date={date.toISOString()}
				data-hidden={isHidden ? 'true' : undefined}
				style={hiddenStyles}
			>
				<span className={cls.separatorContent}>
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
	}
);

DateSeparator.displayName = 'DateSeparator';
export default DateSeparator;
