'use client';

import { memo, useMemo, useCallback, useState } from 'react';
import { filterContacts, useHybridSearch } from '@/shared/ui/Search';
import {
	useBulkDeleteContactsMutation,
	useDeleteContactMutation,
	useGetContactsQuery,
	useLazySearchGlobalContactsQuery
} from '../../api/contactsApi';
import { UserCardSkeleton } from '@/shared/ui/Skeleton';
import { UserCardType } from '@/shared/ui/UserCard';
import {
	CheckContactRequest,
	ContactsSchema,
	GetContactsRequest
} from '../../model/types/contacts.types/contacts.types';
import { ContactsListContent } from '../ContactsListContent/ContactsListContent';
import { sortContactsByStatus } from '../../model/utils/sortContactsByStatus';
import { getContactWordForm } from '../../model/lib/services/getContactWordForm/getContactWordForm';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery/useMediaQuery';
import { ContactsSearch } from '../ContactsSearch/ContactsSearch';
import { SelectionHeader } from '../SelectionHeader/SelectionHeader';
import { SelectionFooter } from '../SelectionFooter/SelectionFooter';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import EmptyContacts from '@/shared/ui/EmptyContacts/EmptyContacts';
import { NotSearch } from '@/shared/ui/NotSearch/NotSearch';
import { ContactsHeader } from '../ContactsHeader/ContactsHeader';
import { SearchSection } from '@/shared/ui/SearchSection';
import { mapGlobalSearchToContactsSchema } from '../../model/mapper/contactsMapper/contactsMapper';

import cls from './ContactsList.module.scss';

// ─────────────────────────────────────────────────────────────
//  КОНСТАНТЫ
// ─────────────────────────────────────────────────────────────
const CONFIG = {
	LOCAL_CACHE_SIZE: 30,
	GLOBAL_SEARCH_MIN_LENGTH: 3,
	SEARCH_DEBOUNCE_MS: 300,
	GLOBAL_SEARCH_PREFIX: '@'
} as const;

export interface ContactsListProps {
	selectedContactUid?: string | null;
	onSelectContact?: (uid: string) => void;
	onContactDeleted?: (uid: string) => void;
}

// ─────────────────────────────────────────────────────────────
// FILTER WRAPPER: адаптирует filterContacts под ContactsSchema
// ─────────────────────────────────────────────────────────────
const filterContactsWrapper = (
	items: ContactsSchema[],
	searchTerm: string
): ContactsSchema[] => {
	const flatItems = items.map(item => ({
		uid: item.uid,
		first_name: item.first_name,
		last_name: item.last_name,
		phone: item.phone,
		nickname: undefined,
		username: undefined
	}));

	const filteredFlat = filterContacts(flatItems, searchTerm);

	const filteredUids = new Set(filteredFlat.map(i => i.uid));
	return items.filter(item => filteredUids.has(item.uid));
};

export const ContactsList = memo(
	({ selectedContactUid, onSelectContact }: ContactsListProps) => {
		const [isSelectionMode, setIsSelectionMode] = useState(false);
		const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
			new Set()
		);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

		const mobile = useMediaQuery();

		// ─────────────────────────────────────────────────────────────
		//  DATA FETCHING
		// ─────────────────────────────────────────────────────────────
		const { data: contactsResponse, isLoading: isCacheLoading } =
			useGetContactsQuery({
				pageSize: CONFIG.LOCAL_CACHE_SIZE,
				ordering: '-created_at'
			} as GetContactsRequest);

		const [searchGlobal] = useLazySearchGlobalContactsQuery();

		// Мутации для удаления
		const [deleteContact] = useDeleteContactMutation();
		const [bulkDeleteContacts] = useBulkDeleteContactsMutation();

		// ─────────────────────────────────────────────────────────────
		//  DATA TRANSFORMATION
		// ─────────────────────────────────────────────────────────────

		const localContacts = useMemo(() => {
			//  Просто берём данные из API и сортируем — типы совпадают
			return sortContactsByStatus(contactsResponse?.results ?? []);
		}, [contactsResponse]);

		// ─────────────────────────────────────────────────────────────
		//  HANDLERS: Selection
		// ─────────────────────────────────────────────────────────────

		const handleToggleSelection = useCallback((contactUid: string) => {
			setSelectedContacts(prev => {
				const next = new Set(prev);
				if (next.has(contactUid)) {
					next.delete(contactUid);
				} else {
					next.add(contactUid);
				}
				return next;
			});
		}, []);

		const handleDeleteSingleContact = useCallback(
			async (contactUid: string) => {
				try {
					await deleteContact(contactUid).unwrap();
				} catch (error: unknown) {
					if (process.env.NODE_ENV === 'development') {
						console.error('Failed to delete contact:', error);
					}
				}
			},
			[deleteContact]
		);

		const handleEnterSelectionMode = useCallback(() => {
			setIsSelectionMode(true);
			setSelectedContacts(new Set());
		}, []);

		const handleResetSelection = useCallback(() => {
			setSelectedContacts(new Set());
		}, []);

		const handleClearSelection = useCallback(() => {
			handleResetSelection();
			setIsSelectionMode(false);
		}, [handleResetSelection]);

		// ─────────────────────────────────────────────────────────────
		//  HANDLERS: Delete Modal
		// ─────────────────────────────────────────────────────────────
		const handleOpenDeleteModal = useCallback(() => {
			if (selectedContacts.size > 0) {
				setIsDeleteModalOpen(true);
			}
		}, [selectedContacts.size]);

		const handleCloseDeleteModal = useCallback(() => {
			setIsDeleteModalOpen(false);
		}, []);

		const handleConfirmDelete = useCallback(async () => {
			try {
				const uids = Array.from(selectedContacts);

				if (uids.length === 1) {
					await deleteContact(uids[0]).unwrap();
				} else {
					await bulkDeleteContacts({ contact_uids: uids }).unwrap();
				}

				handleClearSelection();
				setIsDeleteModalOpen(false);
			} catch (error: unknown) {
				console.error('Failed to delete contacts:', error);
			}
		}, [
			selectedContacts,
			deleteContact,
			bulkDeleteContacts,
			handleClearSelection
		]);

		// ─────────────────────────────────────────────────────────────
		//  HANDLERS: Single Contact Delete
		// ─────────────────────────────────────────────────────────────
		const handleShareContacts = useCallback(() => {
			const selectedContactsData = localContacts.filter(contact =>
				selectedContacts.has(contact.uid)
			);
		}, [selectedContacts, localContacts]);

		// ─────────────────────────────────────────────────────────────
		//  GLOBAL SEARCH
		// ─────────────────────────────────────────────────────────────

		const fetchGlobalContacts = useCallback(
			async (searchTerm: string): Promise<ContactsSchema[]> => {
				const query = searchTerm
					.replace(CONFIG.GLOBAL_SEARCH_PREFIX, '')
					.trim();

				if (query.length < CONFIG.GLOBAL_SEARCH_MIN_LENGTH) {
					return [];
				}

				try {
					const payload: CheckContactRequest[] = [{ phone_or_nickname: query }];
					const result = await searchGlobal(payload).unwrap();

					const resultsArray = Array.isArray(result)
						? result
						: (result?.results ?? []);

					const mapped = resultsArray.map(mapGlobalSearchToContactsSchema);
					return sortContactsByStatus(mapped);
				} catch (error) {
					console.error('❌ Global search error:', error);
					return [];
				}
			},
			[searchGlobal]
		);

		// ─────────────────────────────────────────────────────────────
		// HYBRID SEARCH HOOK
		// ─────────────────────────────────────────────────────────────
		const {
			searchTerm,
			sections,
			totalResults,
			isGlobal,
			isLoading: isSearching,
			error: searchError,
			handleSearchChange,
			handleClear
		} = useHybridSearch<ContactsSchema>(
			localContacts,
			filterContactsWrapper,
			fetchGlobalContacts,
			CONFIG.SEARCH_DEBOUNCE_MS,
			CONFIG.GLOBAL_SEARCH_PREFIX,
			CONFIG.GLOBAL_SEARCH_MIN_LENGTH
		);
		// ─────────────────────────────────────────────────────────────
		//  DERIVED STATE
		// ─────────────────────────────────────────────────────────────
		const searchLength = useMemo(
			() => searchTerm.trim().replace(/^@/, '').length,
			[searchTerm]
		);

		const hasMinLength = searchLength >= CONFIG.GLOBAL_SEARCH_MIN_LENGTH;
		const selectedCount = selectedContacts.size;

		const statusFlags = useMemo(() => {
			const isInitialLoading = isCacheLoading && !contactsResponse;
			const isGlobalSearching = isSearching && isGlobal && hasMinLength;
			const hasSearchTerm = searchTerm.trim().length > 0;

			return {
				shouldShowSkeleton:
					isInitialLoading || (isGlobalSearching && totalResults === 0),
				isEmpty:
					!isCacheLoading &&
					!isSearching &&
					!hasSearchTerm &&
					localContacts.length === 0,
				hasError: !!searchError && isGlobal && hasMinLength
			};
		}, [
			isCacheLoading,
			contactsResponse,
			isSearching,
			isGlobal,
			hasMinLength,
			searchTerm,
			totalResults,
			localContacts.length,
			searchError
		]);

		const searchPlaceholder = useMemo(() => {
			return isGlobal
				? 'Глобальный поиск (@username)...'
				: 'Поиск контактов...';
		}, [isGlobal]);

		const isSearchNoResults = useMemo(() => {
			return searchTerm.trim().length > 0 && !isSearching && totalResults === 0;
		}, [searchTerm, isSearching, totalResults]);

		// ─────────────────────────────────────────────────────────────
		//  DERIVED STATE: Флаг показа хедера
		// ─────────────────────────────────────────────────────────────
		const shouldShowContactsHeader = useMemo(() => {
			if (isGlobal && searchTerm.trim().length > 0 && totalResults > 0) {
				return false;
			}

			return true;
		}, [isGlobal, searchTerm, totalResults]);

		// ─────────────────────────────────────────────────────────────
		//  HELPER: Сохранение превью контакта в localStorage
		// ─────────────────────────────────────────────────────────────

		const handleSelectContactWithPreview = (
			uid: string,
			contact: ContactsSchema | undefined,
			onSelectContact?: (uid: string) => void
		) => {
			const userName =
				contact?.first_name || contact?.last_name || 'Пользователь';

			localStorage.setItem(`chat_preview_${uid}`, JSON.stringify({ userName }));

			onSelectContact?.(uid);
		};

		// ─────────────────────────────────────────────────────────────
		//  RENDER: Loading / Error
		// ─────────────────────────────────────────────────────────────
		if (statusFlags.shouldShowSkeleton) {
			return (
				<div className={cls.contactsList}>
					<ContactsSearch
						value={searchTerm}
						onChange={handleSearchChange}
						onClear={handleClear}
						placeholder='Поиск контактов...'
					/>
					<div className={cls.list} role='listbox' aria-busy='true'>
						<UserCardSkeleton count={8} type={UserCardType.CONTACT} />
					</div>
				</div>
			);
		}

		if (statusFlags.hasError) {
			return (
				<div className={cls.contactsList}>
					<ContactsSearch
						value={searchTerm}
						onChange={handleSearchChange}
						onClear={handleClear}
						placeholder='Глобальный поиск (@username)...'
					/>
					<EmptyContacts />
				</div>
			);
		}

		// ─────────────────────────────────────────────────────────────
		//  RENDER: Main Content
		// ─────────────────────────────────────────────────────────────

		return (
			<div className={cls.contactsList} aria-label='Список контактов'>
				<ContactsSearch
					value={searchTerm}
					onChange={handleSearchChange}
					onClear={handleClear}
					placeholder={searchPlaceholder}
				/>

				{/*  Хедеры рендерятся ТОЛЬКО если поиск дал результаты или не выполнялся */}
				{!isSearchNoResults && (
					<>
						{isSelectionMode && !mobile ? (
							<SelectionHeader
								selectedCount={selectedCount}
								onBack={handleClearSelection}
								onReset={handleResetSelection}
								onDelete={handleOpenDeleteModal}
							/>
						) : shouldShowContactsHeader ? (
							//  Обычный режим: показываем ContactsHeader (кроме глобального поиска)
							<ContactsHeader
								mobile={mobile}
								isSelectionMode={isSelectionMode}
								selectedCount={selectedCount}
								onEnterSelectionMode={handleEnterSelectionMode}
							/>
						) : null}
						{/*  Если shouldShowContactsHeader === false — рендерим null (ничего) */}
					</>
				)}

				{/*   Блок контента: */}
				{isSearchNoResults ? (
					<NotSearch />
				) : statusFlags.isEmpty ? (
					<EmptyContacts />
				) : searchTerm.trim().length === 0 ? (
					<ContactsListContent
						contacts={localContacts}
						selectedContactUid={selectedContactUid}
						isSelectionMode={isSelectionMode}
						selectedContacts={selectedContacts}
						onToggleSelection={handleToggleSelection}
						onDeleteContact={handleDeleteSingleContact}
						onSelectContact={onSelectContact}
					/>
				) : (
					<div className={cls.sectionsContainer}>
						{sections.map((section, index) => (
							<SearchSection
								key={`${section.type}-${index}`}
								title={section.title}
								isLoading={section.isLoading}
								showHeader={section.showHeader ?? true}
							>
								<ContactsListContent
									contacts={section.items}
									selectedContactUid={selectedContactUid}
									isSelectionMode={isSelectionMode}
									selectedContacts={selectedContacts}
									onToggleSelection={handleToggleSelection}
									onDeleteContact={handleDeleteSingleContact}
									onSelectContact={uid => {
										const contact = section.items.find(c => c.uid === uid);
										handleSelectContactWithPreview(
											uid,
											contact,
											onSelectContact
										);
									}}
								/>
							</SearchSection>
						))}
					</div>
				)}

				{/*  Footer тоже скрываем при пустом поиске */}
				{!isSearchNoResults && isSelectionMode && selectedCount > 0 && (
					<SelectionFooter
						mobile={mobile}
						selectedCount={selectedCount}
						onClose={handleClearSelection}
						onShare={handleShareContacts}
						onDelete={handleOpenDeleteModal}
					/>
				)}

				<DeleteModal
					isOpen={isDeleteModalOpen}
					selectedCount={selectedCount}
					onClose={handleCloseDeleteModal}
					onConfirm={handleConfirmDelete}
					getContactWordForm={getContactWordForm}
				/>
			</div>
		);
	}
);

ContactsList.displayName = 'ContactsList';
