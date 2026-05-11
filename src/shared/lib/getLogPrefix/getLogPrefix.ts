//  Хелпер для безопасного получения строки ошибки (без any)
const getLogPrefix = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return String(error);
};

export default getLogPrefix;
