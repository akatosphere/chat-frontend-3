import { classNames } from '@/shared/lib/classNames/classNames';
import React from 'react';

export interface HighlightOptions {
	query: string;
	activeIndices?: number[];
	baseClassName?: string;
	activeClassName?: string;
	caseSensitive?: boolean;
}

export const highlightText = (
	content: string,
	options: HighlightOptions
): React.ReactNode => {
	const {
		query,
		activeIndices = [],
		baseClassName = '',
		activeClassName = '',
		caseSensitive = false
	} = options;

	if (!query.trim()) {
		return content;
	}

	const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const flags = caseSensitive ? 'g' : 'gi';

	const regex = new RegExp(`(${escapedQuery})`, flags);
	const parts = content.split(regex);

	let occurrenceCounter = 0;

	return parts.map((part, index) => {
		if (!part) {
			return null;
		}

		const matchRegex = new RegExp(
			`^${escapedQuery}$`,
			caseSensitive ? '' : 'i'
		);
		const isMatch = matchRegex.test(part);

		if (isMatch) {
			const isActive = activeIndices.includes(occurrenceCounter);

			occurrenceCounter++;

			return (
				<mark
					key={index}
					className={classNames(baseClassName, {
						[activeClassName]: isActive
					})}
				>
					{part}
				</mark>
			);
		}

		return <span key={index}>{part}</span>;
	});
};
