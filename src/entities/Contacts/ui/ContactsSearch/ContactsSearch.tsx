import { memo } from 'react';
import { Search } from '@/shared/ui/Search';

import cls from './ContactsSearch.module.scss';

export interface ContactsSearchProps {
	value: string;
	onChange: (value: string) => void;
	onClear?: () => void;
	placeholder: string;
}

export const ContactsSearch = memo(
	({ value, onChange, onClear, placeholder }: ContactsSearchProps) => {
		return (
			<div className={cls.search}>
				<Search
					value={value}
					onChange={onChange}
					onClear={onClear}
					placeholder={placeholder}
					showIcon
				/>
			</div>
		);
	}
);

ContactsSearch.displayName = 'ContactsSearch';
