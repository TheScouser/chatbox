import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./server";

// Cleanup after each test case
afterEach(() => {
	cleanup();
});

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Convex client for tests
vi.mock("convex/react", () => ({
	useQuery: vi.fn(),
	useMutation: vi.fn(),
	useAction: vi.fn(),
	ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Clerk for tests
vi.mock("@clerk/clerk-react", () => ({
	useAuth: vi.fn(() => ({
		isSignedIn: true,
		userId: "test-user-id",
	})),
	useUser: vi.fn(() => ({
		user: {
			id: "test-user-id",
			emailAddresses: [{ emailAddress: "test@example.com" }],
			firstName: "Test",
			lastName: "User",
		},
	})),
	SignIn: vi.fn(() => null),
	SignUp: vi.fn(() => null),
	UserButton: vi.fn(() => null),
}));

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(() => vi.fn()),
	useParams: vi.fn(() => ({})),
	useSearch: vi.fn(() => ({})),
	// biome-ignore lint/suspicious/noExplicitAny: test mock, Link component returns ReactNode
	Link: ({ children }: { children: React.ReactNode }) => children as any,
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Stub scrollIntoView for JSDOM
// @ts-ignore
if (!HTMLElement.prototype.scrollIntoView) {
	// @ts-ignore
	HTMLElement.prototype.scrollIntoView = vi.fn();
}
