import { logger } from '@/shared/lib/logger/logger';
import { NextRequest, NextResponse } from 'next/server';

const handler = (request: NextRequest) => handleProxy(request);
export { handler as DELETE, handler as GET, handler as POST, handler as PUT };

const excludeHeaders = [
	'host',
	'connection',
	'content-length',
	'accept-encoding',
	'set-cookie',
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
			body
		});

		const responseHeaders = new Headers(res.headers);

		excludeHeaders.forEach(h => {
			if (h !== 'set-cookie') {
				responseHeaders.delete(h);
			}
		});

		const setCookie = res.headers.get('set-cookie');
		if (setCookie) {
			responseHeaders.set('set-cookie', setCookie);
		}

		const response = new NextResponse(res.body, {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders
		});

		return response;
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			logger.error('Proxy error:', error);
		}

		// В начале handleProxy, для development:
		if (process.env.NODE_ENV === 'development' && needsAuthCookie) {
			logger.log('[Proxy] Auth endpoint request:', {
				path,
				hasCookie: request.headers.has('cookie'),
				cookiePreview: request.headers.get('cookie')?.slice(0, 80) + '...',
				targetUrl
			});
		}
		return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
	}
}
