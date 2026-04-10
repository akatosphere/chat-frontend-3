import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const { session_uid, session_secret } = await request.json();

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_API}/auth/providers/plusofon/flash-call/claim/${session_uid}/`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ session_secret })
		}
	);

	if (!res.ok) {
		const err = await res.json();

		return NextResponse.json(
			{ errors: err || ['Ошибка входа'] },
			{ status: 400 }
		);
	}
	const data = await res.json();

	// Создаём ответ
	const response = NextResponse.json(
		{ success: true, is_filled: data.is_filled },
		{ status: 200 }
	);
	// Устанавливаем Access Token
	response.cookies.set('accessToken', data.access, {
		path: '/',
		httpOnly: true,
		secure: true,
		maxAge: 10 * 60 // 10 минут
	});

	// Устанавливаем Refresh Token
	response.cookies.set('refreshToken', data.refresh, {
		path: '/',
		httpOnly: true,
		secure: true,
		maxAge: 30 * 24 * 60 * 60 // 30 дней
	});

	return response;
}
