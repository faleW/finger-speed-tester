import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
const chromeDevtoolHandle: Handle = async ({ event, resolve }) => {
    // Suppress well-known Chrome DevTools requests
    if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools'))
        return new Response(null, { status: 204 }); // Return empty response with 204 No Content
    return await resolve(event);

};

export const handle: Handle = sequence(chromeDevtoolHandle)
