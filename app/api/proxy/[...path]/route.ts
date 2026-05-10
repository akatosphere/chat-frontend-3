import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/shared/lib/logger/logger';

const handler = (request: NextRequest) => handleProxy(request);
export { handler as DELETE, handler as GET, handler as POST, handler as PUT };

const excludeHeaders = [
	'host',
	'connection',
	'content-length',
	'accept-encoding',
	'transfer-encoding',
	'content-encoding'
];

const AUTH_START_PATHS = [
	'/auth/providers',
	'/auth/login',
	'/auth/registration',
	'/auth/verify',
	'/auth/flash-call',
	'/auth/phone',
	'/auth/check'
];

const AUTH_COOKIE_PATHS = [
	'/auth/refresh',
	'/auth/getAccessToken',
	'/auth/logout'
];

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

async function handleProxy(request: NextRequest): Promise<NextResponse> {
	const path = request.nextUrl.pathname.replace(
		process.env.NEXT_PUBLIC_PROXY_PREFIX as string,
		''
	);

	const baseUrl = `${process.env.NEXT_PUBLIC_BASE_API}${path}/`;
	const search = request.nextUrl.search;
	const targetUrl = search ? `${baseUrl}${search}` : baseUrl;

	const isAuthStart = AUTH_START_PATHS.some(p => path.includes(p));
	const needsAuthCookie = AUTH_COOKIE_PATHS.some(p => path.includes(p));

	const headers = new Headers();

	request.headers.forEach((value, key) => {
		const lowerKey = key.toLowerCase();

		if (excludeHeaders.includes(lowerKey)) {
			if (lowerKey === 'cookie' && needsAuthCookie) {
				headers.set(key, value);
			}
			return;
		}

		if (isAuthStart && lowerKey === 'authorization') {
			return;
		}

		headers.set(key, value);
	});

	const accessToken = request.cookies.get('accessToken')?.value;
	if (accessToken && !headers.has('Authorization') && !isAuthStart) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}

	const body =
		request.method !== 'GET' && request.method !== 'HEAD'
			? await request.text()
			: undefined;

	try {
		const res = await fetch(targetUrl, {
			method: request.method,
			headers,
			body,
			credentials:
				process.env.NODE_ENV === 'production' ? 'include' : 'same-origin'
		});

		if (
			path.includes('/auth/providers/plusofon/flash-call/claim/') ||
			path.includes('/auth/refresh') ||
			path.includes('/auth/getAccessToken')
		) {
			const data = await res.clone().json();
			const response = new NextResponse(JSON.stringify(data), {
				status: res.status,
				headers: { 'content-type': 'application/json' }
			});

			if (data.access) {
				response.cookies.set('accessToken', data.access, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: 15 * 60
				});
			}

			if (data.refresh) {
				response.cookies.set('refreshToken', data.refresh, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: 7 * 24 * 60 * 60
				});
			}

			if (data.access) {
				response.cookies.set('ws_access_token', data.access, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
					domain:
						process.env.NODE_ENV === 'production' ? '.ktsf.ru' : undefined,
					path: '/',
					maxAge: 15 * 60
				});
			}

			res.headers.forEach((value, key) => {
				const lowerKey = key.toLowerCase();
				if (
					!['set-cookie', 'content-length', 'content-encoding'].includes(
						lowerKey
					)
				) {
					response.headers.set(key, value);
				}
			});

			return response;
		}

		const responseHeaders = new Headers();
		res.headers.forEach((value, key) => {
			const lowerKey = key.toLowerCase();
			if (!excludeHeaders.includes(lowerKey)) {
				responseHeaders.set(key, value);
			}
		});

		const rawCookies =
			typeof res.headers.getSetCookie === 'function'
				? res.headers.getSetCookie()
				: ([res.headers.get('set-cookie')].filter(Boolean) as string[]);

		rawCookies.forEach(cookie => {
			responseHeaders.append('set-cookie', cookie);
		});

		return new NextResponse(res.body, {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders
		});
	} catch (error: unknown) {
		logger.error('Proxy error', {
			category: 'api',
			prefix: getLogPrefix(error),
			sendToSentry: true
		});

		return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
	}
}
