import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Central MSW server for Node/Vitest tests. Handlers can be extended per-test.
export const server =
	setupServer(
		// Example placeholder handler to illustrate pattern; extend in tests as needed.
		// http.post('/api/chat', async () => HttpResponse.json({ messages: [] })),
	);

export { http, HttpResponse };
