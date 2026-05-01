export function formatDateRu(unixDate: string) {
	const date = new Date(unixDate);
	const day = String(date.getDate()).padStart(2, '0');
	const months = [
		'января',
		'февраля',
		'марта',
		'апреля',
		'мая',
		'июня',
		'июля',
		'августа',
		'сентября',
		'октября',
		'ноября',
		'декабря'
	];

	return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
