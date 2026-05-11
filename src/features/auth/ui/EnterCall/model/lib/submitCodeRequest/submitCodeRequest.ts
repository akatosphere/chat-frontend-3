interface submitCodeRequestProps {
	phone_number: string;
	code: string;
}

export const submitCodeRequest = async ({
	phone_number,
	code
}: submitCodeRequestProps) => {
	const response = await fetch('/api/auth/setTokens', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ phone_number, code })
	});

	return response.json();
};
