export const toProxyPath = (url: string | null): string | null => {
	if (!url) {
		return null;
	}
	if (url.startsWith('/api/proxy')) {
		return url;
	}

	try {
		const pathname = url.startsWith('http') ? new URL(url).pathname : url;
		const apiPath = pathname.replace(/^\/api\/v1/, '');
		return `/api/proxy${apiPath}`;
	} catch {
		return null;
	}
};
