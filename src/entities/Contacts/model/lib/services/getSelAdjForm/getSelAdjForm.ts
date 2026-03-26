/**
 * Склоняет прилагательное "выбранный" в зависимости от числа
 * для конструкции: "{count} {form} {noun}"
 * Пример: "2 выбранных контакта"
 */
export const getSelAdjForm = (count: number): string => {
	const n = Math.abs(count);

	if (n % 10 === 1 && n % 100 !== 11) {
		return 'выбранный';
	}

	return 'выбранных';
};
