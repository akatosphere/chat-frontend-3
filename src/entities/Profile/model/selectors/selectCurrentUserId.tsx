import { RootState } from '@/app/providers/StoreProvider';

export const selectCurrentUserId = (state: RootState): string | null => {
	return state.auth.currentUserId;
};
