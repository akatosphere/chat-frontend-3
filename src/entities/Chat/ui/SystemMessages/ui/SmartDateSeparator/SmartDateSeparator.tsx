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
	const { registerSeparator, unregisterSeparator, isHidden } =
		useStickyDateContext();

	useEffect(() => {
		const el = elementRef.current;
		if (!el) {
			return;
		}

		registerSeparator(id, date, el);

		return () => {
			unregisterSeparator(id);
		};
	}, [id, date, registerSeparator, unregisterSeparator]);

	return (
		<DateSeparator
			ref={elementRef}
			date={date}
			className={className}
			isHidden={isHidden(id)}
		/>
	);
};

export default SmartDateSeparator;
