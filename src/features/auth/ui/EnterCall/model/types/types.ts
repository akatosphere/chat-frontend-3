export type AuthMethod = 'sms' | 'reverse_call';

export interface PlusofonStartResponse {
	session_uid: string;
	session_secret: string;
	call_number: string;
	expires_at: number;
	poll_interval_seconds: number;
	attempt_number: number;
	block_duration_seconds: number | null;
	block_created_at: string | null;
}

export interface PlusofonStatusResponse {
	status: 'pending' | 'verified' | 'expired' | 'failed';
	verified_at: string | null;
	expires_at: number;
	poll_interval_seconds: number;
}

export interface PlusofonAuthResponse {
	access: string;
	refresh: string;
	is_filled: boolean;
}
