export const formatUnixToLocalTime = (unixTime: number): string => {
	const timestamp = unixTime > 1e10 ? unixTime : unixTime * 1000;

	const date = new Date(timestamp);

	return date.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
};
