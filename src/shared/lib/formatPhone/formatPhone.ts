export const formatPhone = (phone: string | undefined): string => {
	if (!phone) {
		return '';
	}

	const digits = phone.replace(/\D/g, '');

	const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;

	if (normalized.length !== 11) {
		return phone;
	}

	return (
		`+${normalized[0]} ` +
		`(${normalized.slice(1, 4)}) ` +
		`${normalized.slice(4, 7)}-` +
		`${normalized.slice(7, 9)}-` +
		`${normalized.slice(9, 11)}`
	);
};

export const maskPhone = (value: string, prevValue?: string): string => {
	const digits = value.replace(/\D/g, '');
	const prevDigits = prevValue?.replace(/\D/g, '') || '';

	if (digits.length < prevDigits.length) {
		return digits ? `+${digits}` : '';
	}

	const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;

	if (!normalized.startsWith('7')) {
		return normalized ? `+${normalized}` : '';
	}

	if (normalized.length === 1) {
		return `+${normalized}`;
	}
	if (normalized.length <= 4) {
		return `+${normalized}`;
	}
	if (normalized.length <= 7) {
		return `+${normalized[0]} (${normalized.slice(1)})`;
	}
	if (normalized.length <= 9) {
		return `+${normalized[0]} (${normalized.slice(1, 4)}) ${normalized.slice(4)}`;
	}
	if (normalized.length <= 11) {
		return `+${normalized[0]} (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
	}

	return `+${normalized[0]} (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
};

export const unmaskPhone = (value: string): string => {
	return value.replace(/\D/g, '');
};
