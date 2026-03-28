'use client';

import React, { useEffect, useRef } from 'react';
import DateSeparator from '../DateSeparator/DateSeparator';
import { useStickyDate } from '../StickyDateContext/StickyDateContext';

interface SmartDateSeparatorProps {
	date: Date;
	id: string;
	className?: string;
}

export const SmartDateSeparator: React.FC<SmartDateSeparatorProps> = ({
	date,
	id,
	className = ''
}) => {
	const { registerSeparator, unregisterSeparator, isActive, isHidden } =
		useStickyDate();
	const elementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) {
			return;
		}

		registerSeparator(id, date, element);
		return () => unregisterSeparator(id);
	}, [id, date, registerSeparator, unregisterSeparator]);

	const shouldBeHidden = isHidden(id) || isActive(id);

	return (
		<DateSeparator
			ref={elementRef}
			date={date}
			className={className}
			isHidden={shouldBeHidden}
		/>
	);
};

export default SmartDateSeparator;
