import { NextRequest, NextResponse } from 'next/server';

const handler = (request: NextRequest) => handleProxy(request);
export { handler as DELETE, handler as GET, handler as POST, handler as PUT };

const excludeHeaders = [
	'host',
	'connection',
	'content-length',
	'cookie',
	'accept-encoding',
	'set-cookie',
	'transfer-encoding',
	'content-encoding'
];

async function handleProxy(request: NextRequest): Promise<NextResponse> {
	const path = request.nextUrl.pathname.replace(
		process.env.NEXT_PUBLIC_PROXY_PREFIX as string,
		''
	);

	const baseUrl = `${process.env.NEXT_PUBLIC_BASE_API}${path}/`;
	const search = request.nextUrl.search;

	const targetUrl = search ? `${baseUrl}${search}` : baseUrl;

	const accessToken = request.cookies.get('accessToken')?.value;

	const headers = new Headers();
	request.headers.forEach((value, key) => {
		if (!excludeHeaders.includes(key)) {
			headers.set(key, value);
		}
	});

	if (accessToken && !headers.has('Authorization')) {
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
		excludeHeaders.forEach(h => responseHeaders.delete(h));

		const response = new NextResponse(res.body, {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders
		});

		return response;
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Proxy error:', error);
		}
		return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
	}
}
