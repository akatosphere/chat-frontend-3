'use client';

import { useEffect, useRef } from 'react';
import { useStickyDateContext } from '../StickyDateContext/StickyDateContext';
import DateSeparator from '../DateSeparator/DateSeparator';

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
	const elementRef = useRef<HTMLDivElement>(null);
	const { registerSeparator, unregisterSeparator, isActive, isHidden } =
		useStickyDateContext();

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
