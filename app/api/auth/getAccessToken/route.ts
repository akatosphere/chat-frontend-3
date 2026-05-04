import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const cookieStore = await cookies();

		//  Проверяем ВСЕ возможные имена кук
		const accessToken =
			cookieStore.get('accessToken')?.value ??
			cookieStore.get('access_token')?.value ??
			cookieStore.get('access')?.value ??
			null;

		if (!accessToken) {
			//  Возвращаем корректный JSON, а не HTML-404
			return NextResponse.json({ error: 'No access token' }, { status: 401 });
		}

		//  Возвращаем в формате, который ожидает TokenManager
		return NextResponse.json({
			access: accessToken, //  для data.access
			accessToken: accessToken //  для data.accessToken
		});
	} catch (error) {
		console.error('[getAccessToken] Error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}
