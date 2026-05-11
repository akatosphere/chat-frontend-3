export const isErrorWithMessage = (error: unknown): error is Error => {
	return error instanceof Error;
};

export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'Unknown error';
};
