import { env } from '$env/dynamic/private';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

const BACKEND_URL = `http://localhost:${env.PORT_BACKEND || 4000}`;

const handleRequest: RequestHandler = async ({ request, params, fetch }) => {
	const url = new URL(request.url);
	const slug = params.slug || '';
	const targetUrl = `${BACKEND_URL}/${slug}${url.search}`;

	try {
		const proxyRequest = new Request(targetUrl, {
			method: request.method,
			headers: request.headers,
			body: request.body,
			duplex: 'half',
		} as RequestInit);

		const response = await fetch(proxyRequest);

		return response;
	} catch (error) {
		console.error('Proxy request failed:', error);
		return json(
			{ message: `Failed to connect to the backend service. ${JSON.stringify(error)}` },
			{ status: 500 }
		);
	}
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
