import { rtkApi } from '@/shared/api/rtkApi';
import type {
	ContactsSchema,
	GetContactsRequest,
	AddContactByPhoneRequest,
	AddContactResponse,
	GlobalSearchResponse,
	PaginatedResponse,
	CheckContactRequest,
	PaginatedContactReadByUidList,
	BulkDeleteRequest,
	GlobalSearchContact
} from '../model/types/contacts.types/contacts.types';

export const contactApi = rtkApi.injectEndpoints({
	endpoints: build => ({
		getContacts: build.query<
			PaginatedResponse<ContactsSchema>,
			GetContactsRequest
		>({
			query: params => ({
				url: '/contact/messenger-list/',
				method: 'GET',
				params: {
					page_size: params.pageSize ?? 30,
					ordering: params.ordering ?? '-created_at',
					search: params.search
				}
			}),
			providesTags: result =>
				result
					? [
							...result.results.map(({ uid }) => ({
								type: 'Contacts' as const,
								uid
							})),
							{ type: 'Contacts' as const, id: 'LIST' }
						]
					: [{ type: 'Contacts' as const, id: 'LIST' }]
		}),

		searchGlobalContacts: build.query<
			GlobalSearchResponse, // Оставляем тип с пагинацией
			CheckContactRequest[]
		>({
			query: body => ({
				url: '/contact/check/list/',
				method: 'POST',
				body
			}),
			providesTags: ['GlobalContactSearch'],

			transformResponse: (
				response: GlobalSearchContact[]
			): GlobalSearchResponse => ({
				count: response.length,
				next: null,
				previous: null,
				results: response
			})
		}),

		addContactByPhone: build.mutation<
			AddContactResponse,
			AddContactByPhoneRequest
		>({
			query: body => ({
				url: '/contact/messenger-add-by-phone/',
				method: 'POST',
				body
			}),
			invalidatesTags: ['Contacts', { type: 'Contacts', id: 'LIST' }]
		}),

		// Удаление одного контакта (204 No Content)
		deleteContact: build.mutation<void, string>({
			query: (contactUid: string) => ({
				url: `/contact/messenger-delete-contact/${encodeURIComponent(contactUid)}/`,
				method: 'DELETE'
			}),
			async onQueryStarted(contactUid, { dispatch, getState, queryFulfilled }) {
				const state = getState();
				const cachedArgs = contactApi.util.selectCachedArgsForQuery(
					state,
					'getContacts'
				);

				const patches = cachedArgs.map(args =>
					dispatch(
						contactApi.util.updateQueryData(
							'getContacts',
							args as GetContactsRequest,
							draft => {
								if (draft?.results) {
									const initialLength = draft.results.length;
									draft.results = draft.results.filter(
										c => c.uid !== contactUid
									);

									if (draft.results.length < initialLength) {
										draft.count = Math.max(0, draft.count - 1);
									}
								}
							}
						)
					)
				);

				try {
					await queryFulfilled;
				} catch {
					// Откатываем все изменения при ошибке сервера
					patches.forEach(patch => patch.undo());
				}
			},
			// Страховка: перезагрузит список, если оптимистичное обновление не покрыло все кейсы
			invalidatesTags: [{ type: 'Contacts', id: 'LIST' }]
		}),

		//  Массовое удаление (200 с телом)
		bulkDeleteContacts: build.mutation<
			PaginatedContactReadByUidList,
			BulkDeleteRequest
		>({
			query: body => ({
				url: '/contact/messenger/bulk-delete/',
				method: 'POST',
				body
			}),
			async onQueryStarted(
				{ contact_uids },
				{ dispatch, getState, queryFulfilled }
			) {
				const state = getState();
				const cachedArgs = contactApi.util.selectCachedArgsForQuery(
					state,
					'getContacts'
				);

				const patches = cachedArgs.map(args =>
					dispatch(
						contactApi.util.updateQueryData(
							'getContacts',
							args as GetContactsRequest,
							draft => {
								if (draft?.results) {
									const initialLength = draft.results.length;
									draft.results = draft.results.filter(
										c => !contact_uids.includes(c.uid)
									);
									const removedCount = initialLength - draft.results.length;
									if (removedCount > 0) {
										draft.count = Math.max(0, draft.count - removedCount);
									}
								}
							}
						)
					)
				);

				try {
					await queryFulfilled;
				} catch {
					patches.forEach(patch => patch.undo());
				}
			},
			invalidatesTags: [{ type: 'Contacts', id: 'LIST' }]
		})
	}),
	overrideExisting: false
});

export const {
	useGetContactsQuery,
	useLazyGetContactsQuery,
	useSearchGlobalContactsQuery,
	useLazySearchGlobalContactsQuery,
	useAddContactByPhoneMutation,
	useDeleteContactMutation,
	useBulkDeleteContactsMutation
} = contactApi;
