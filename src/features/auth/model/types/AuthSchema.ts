import { AuthStep } from './authStep';

export interface PhoneSessionData {
	session_uid?: string;
	session_secret?: string;

	call_number?: string;
	expires_at?: number;
	poll_interval_seconds?: number;
	attempt_number?: number;

	blocked_until?: string;
	block_duration_seconds?: number;
	block_created_at?: number;
	isInitialized?: boolean;
}

export interface AuthSchema {
	step: AuthStep;
	stepHistory: AuthStep[];
	isRefreshing: boolean;
	phone_number: string;
	status: 'idle' | 'loading' | 'success' | 'error';
	error: string | null;

	is_filled: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	currentUserId: string | null;

	phoneSession?: PhoneSessionData;
}
