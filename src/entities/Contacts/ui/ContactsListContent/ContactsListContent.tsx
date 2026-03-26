'use client';

import { memo, useMemo } from 'react';
import { ContactsSchema } from '../../model/types/contacts.types/contacts.types';
import { ContactsListItem } from '../ContactsItem/ContactsItem';

import cls from './ContactsListContent.module.scss';

export const ContactsListContent = memo(
	({
		contacts,
		selectedContactUid,
		onSelectContact,
		isSelectionMode = false,
		selectedContacts = new Set<string>(),
		onToggleSelection,
		onDeleteContact
	}: {
		contacts: ContactsSchema[];
		selectedContactUid?: string | null;
		onSelectContact?: (uid: string) => void;
		isSelectionMode?: boolean;
		selectedContacts?: Set<string>;
		onToggleSelection?: (uid: string) => void;
		onDeleteContact?: (uid: string) => void;
	}) => {
		const renderedItems = useMemo(
			() =>
				contacts.map(contact => {
					const contactUid = contact.system_contact.uid;
					const isSelected = selectedContacts.has(contactUid);

					return (
						<ContactsListItem
							key={contact.uid}
							contact={contact}
							isActive={selectedContactUid === contactUid}
							onClick={() => {
								if (isSelectionMode) {
									onToggleSelection?.(contactUid);
								} else {
									onSelectContact?.(contactUid);
								}
							}}
							isSelectionMode={isSelectionMode}
							isSelected={isSelected}
							onDeleteContact={() => onDeleteContact?.(contactUid)}
						/>
					);
				}),
			[
				contacts,
				selectedContactUid,
				onSelectContact,
				isSelectionMode,
				selectedContacts,
				onToggleSelection
			]
		);

		return (
			<div className={cls.list} role='listbox' aria-multiselectable='false'>
				{renderedItems}
			</div>
		);
	}
);
ContactsListContent.displayName = 'ContactsListContent';
