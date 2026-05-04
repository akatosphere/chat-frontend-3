import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get('refreshToken')?.value;

	if (!refreshToken) {
		const response = NextResponse.json(
			{ error: 'No refresh token' },
			{ status: 401 }
		);
		response.cookies.delete('accessToken');
		response.cookies.delete('refreshToken');
		return response;
	}

	try {
		const apiRes = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_API}/${process.env.NEXT_PUBLIC_REFRESH}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',

					Cookie: `refreshToken=${refreshToken}`,
					'X-CSRFToken': request.headers.get('x-csrftoken') || ''
				},
				body: JSON.stringify({ refresh: refreshToken })
			}
		);

		if (!apiRes.ok) {
			const response = NextResponse.json(
				{ error: 'Refresh failed' },
				{ status: 401 }
			);
			response.cookies.delete('accessToken');
			response.cookies.delete('refreshToken');
			return response;
		}

		const data = await apiRes.json();

		const response = NextResponse.json(
			{ access: data.access },
			{ status: 200 }
		);

		response.cookies.set('accessToken', data.access, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 10 * 60,
			sameSite: 'strict',
			path: '/'
		});

		if (data.refresh) {
			response.cookies.set('refreshToken', data.refresh, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 30 * 24 * 60 * 60,
				sameSite: 'strict',
				path: '/'
			});
		}

		return response;
	} catch (_) {
		const response = NextResponse.json(
			{ error: 'Refresh request error' },
			{ status: 502 }
		);
		response.cookies.delete('accessToken');
		response.cookies.delete('refreshToken');
		return response;
	}
}
