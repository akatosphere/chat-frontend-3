import { ReactNode } from 'react';

export interface KebabMenuItem {
	text: string;
	icon: ReactNode;
	onClick: () => void;
	danger?: boolean;
}
