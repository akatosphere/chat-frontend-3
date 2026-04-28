export const toProxyPath = (url: string | null): string | null => {
	if (!url) {
		return null;
	}
	if (url.startsWith('/api/proxy')) {
		return url;
	}

	try {
		const parsed = url.startsWith('http') ? new URL(url) : null;

		const pathname = parsed ? parsed.pathname : url;
		const search = parsed ? parsed.search : '';

		const apiPath = pathname.replace(/^\/api\/v1/, '');

		return `/api/proxy${apiPath}${search}`;
	} catch {
		return null;
	}
};
