import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSchema, PhoneSessionData } from '../types/AuthSchema';
import { AuthStep } from '../types/authStep';

const initialState: AuthSchema = {
	step: 'greeting',
	stepHistory: ['greeting'],
	isRefreshing: false,
	phone_number: '',
	status: 'idle',
	error: null,
	is_filled: false,
	accessToken: null,
	refreshToken: null,
	currentUserId: null,
	phoneSession: undefined
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setRefreshing: (state, action: PayloadAction<boolean>) => {
			state.isRefreshing = action.payload;
		},

		logout: () => initialState,

		setPhoneData: (state, action: PayloadAction<{ phone_number: string }>) => {
			state.phone_number = action.payload.phone_number;
		},

		setPhoneSession: (
			state,
			action: PayloadAction<Partial<PhoneSessionData>>
		) => {
			if (!state.phoneSession) {
				state.phoneSession = {};
			}

			Object.assign(state.phoneSession, action.payload);
		},

		clearPhoneData: state => {
			state.phone_number = '';
			state.phoneSession = undefined;
		},

		setStep: (state, action: PayloadAction<AuthStep>) => {
			const nextStep = action.payload;
			if (state.step !== nextStep) {
				state.stepHistory.push(nextStep);
				state.step = nextStep;
			}
		},

		setTokens: (
			state,
			action: PayloadAction<{ access: string; refresh: string }>
		) => {
			state.accessToken = action.payload.access;
			state.refreshToken = action.payload.refresh;
		},

		setIsFilled: (state, action: PayloadAction<boolean>) => {
			state.is_filled = action.payload;
		},

		setCurrentUserId: (state, action: PayloadAction<string>) => {
			state.currentUserId = action.payload;
		},

		goBack: state => {
			if (state.stepHistory.length > 1) {
				state.stepHistory.pop();
				state.step = state.stepHistory[state.stepHistory.length - 1];
			}
		}
	},
	extraReducers: builder => {
		// Здесь можно обработать финалы RTK Query, если нужно
	}
});

export const { reducer: authReducer, actions: authActions } = authSlice;
