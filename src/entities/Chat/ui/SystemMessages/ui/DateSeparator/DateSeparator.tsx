'use client';

import React, { forwardRef } from 'react';
import { formatDateSeparator } from '@/entities/Chat/model/lib/service/dateFormating/dateFormater';
import { Text, TextColor, TextSize, TextTag, TextType } from '@/shared/ui/Text';

import cls from './DateSeparator.module.scss';

interface DateSeparatorProps {
	date: Date;
	className?: string;
	observerId?: string;
}

const DateSeparator = forwardRef<HTMLDivElement, DateSeparatorProps>(
	({ date, className = '', observerId }, ref) => {
		const label = formatDateSeparator(date);

		return (
			<div
				ref={ref}
				className={`${cls.dateSeparator} ${className}`}
				data-observer-id={observerId}
				data-date={date.toISOString()}
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
