import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

// Mock organization context
const mockOrganizationContext = {
	currentOrganization: {
		_id: "test-org-id" as const,
		name: "Test Organization",
		createdAt: Date.now(),
		plan: "free" as const,
	},
	userRole: "owner" as const,
	isOwner: true,
	isAdmin: true,
	canEdit: true,
	isLoading: false,
};

// Create a test wrapper component
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

// Custom render function
const customRender = (
	ui: React.ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createMockAgent = (overrides = {}) => ({
	_id: "test-agent-id",
	name: "Test Agent",
	description: "A test agent",
	organizationId: "test-org-id",
	isPublic: true,
	createdAt: Date.now(),
	updatedAt: Date.now(),
	...overrides,
});

export const createMockConversation = (overrides = {}) => ({
	_id: "test-conversation-id",
	agentId: "test-agent-id",
	organizationId: "test-org-id",
	createdAt: Date.now(),
	lastMessageAt: Date.now(),
	...overrides,
});

export const createMockMessage = (overrides = {}) => ({
	_id: "test-message-id",
	conversationId: "test-conversation-id",
	content: "Test message content",
	role: "user" as const,
	createdAt: Date.now(),
	...overrides,
});

export const createMockKnowledgeEntry = (overrides = {}) => ({
	_id: "test-knowledge-id",
	agentId: "test-agent-id",
	organizationId: "test-org-id",
	type: "text" as const,
	content: "Test knowledge content",
	source: "manual",
	createdAt: Date.now(),
	...overrides,
});

// Mock Convex hooks - simplified for now
export const mockUseQuery = (returnValue: any) => {
	return vi.fn().mockReturnValue(returnValue);
};

export const mockUseMutation = () => {
	return vi.fn().mockResolvedValue({});
};

export const mockUseAction = () => {
	return vi.fn().mockResolvedValue({});
};

// Organization context mock
export { mockOrganizationContext };
