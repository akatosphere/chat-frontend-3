import { AuthStep } from './authStep';

export interface PhoneSessionData {
	session_uid?: string;
	session_secret?: string;
	call_number?: string;
	expires_at?: string;
	poll_interval_seconds?: number;
	// поля ошибок
	blocked_until?: string;
	attempt_number?: number;
	block_duration_seconds?: number | null;
	block_created_at?: number | null;
}

export interface AuthSchema {
	step: AuthStep;
	stepHistory: AuthStep[];
	isRefreshing: boolean;
	phone_number?: string;
	phoneSession?: PhoneSessionData;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
	isDisabledCodeAttempts: boolean;
	is_filled: boolean;
	blockingTime: number | undefined;
	attemptCounter: number;
	accessToken: string | null;
	currentUserId: string | null;
}
