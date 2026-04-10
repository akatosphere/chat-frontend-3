// endpoint - start
export interface StartRequest {
	phone_number: string;
}

export interface StartResponseOk {
	session_uid: string;
	session_secret: string;
	call_number: string;
	expires_at: string;
	poll_interval_seconds: number;
	attempt_number: number;
	block_duration_seconds: null;
	block_created_at: null;
}

export interface StartResponseErr {
	message: string;
	blocked_until?: string;
	attempt_number?: number;
	block_duration_seconds?: number;
	block_created_at?: number;
}

// endpoint - status
export interface StatusRequest {
	session_secret: string;
}

export interface StatusResponse {
	status: 'pending' | 'verified' | 'expired' | 'consumed';
	session_uid: string;
	expires_at: string;
	poll_interval_seconds: number;
	is_claim_available: boolean;
}

// endpoint - claim
export interface ClaimRequest {
	session_secret: string;
}

export interface ClaimResponse {
	access: string;
	refresh: string;
	is_filled: boolean;
}

// регистрация
export interface IRegister {
	name: string;
	nickname: string;
}

export interface RegisterResponse {
	messages: string;
}
