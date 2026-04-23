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
							isSelectionMode={isSelectionMode}
							isSelected={isSelected}
							onClick={() => {
								if (isSelectionMode) {
									onToggleSelection?.(contactUid);
								} else {
									onSelectContact?.(contactUid);
								}
							}}
							// ✅ ИЗМЕНЕНИЕ ЗДЕСЬ:
							onDeleteContact={() => {
								console.log(
									'🗑️ ContactsListContent: delete clicked for',
									contact.uid
								);
								onDeleteContact?.(contact.uid);
							}}
						/>
					);
				}),
			[
				contacts,
				selectedContacts,
				selectedContactUid,
				isSelectionMode,
				onToggleSelection,
				onSelectContact,
				onDeleteContact
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
