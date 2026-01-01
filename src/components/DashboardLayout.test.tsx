import { renderWithProviders } from "@/test/render";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as OrgContext from "../contexts/OrganizationContext";
import * as AgentHook from "../hooks/useAgent";
import DashboardLayout from "./DashboardLayout";

// Mock dependencies
vi.mock("../contexts/OrganizationContext");
vi.mock("../hooks/useAgent");
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual("@tanstack/react-router");
	return {
		...actual,
		useLocation: vi.fn(() => ({ pathname: "/dashboard" })),
		useNavigate: vi.fn(() => vi.fn()),
		Link: (props: any) => <a {...props}>{props.children}</a>,
	};
});

describe("DashboardLayout", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Default generic mocks
		vi.mocked(OrgContext.useOrganization).mockReturnValue({
			selectedOrganizationId: "org-1",
			setSelectedOrganizationId: vi.fn(),
			currentOrganization: { _id: "org-1", name: "Test Org" },
			organizations: [{ _id: "org-1", name: "Test Org" }],
			isLoading: false,
		} as any);

		vi.mocked(AgentHook.useAgent).mockReturnValue({
			agents: [],
			currentAgent: null,
			isLoading: false,
			showAgentSidebar: false,
		} as any);
	});

	it("renders global navigation when no agent is selected", () => {
		renderWithProviders(
			<DashboardLayout>
				<div>Content</div>
			</DashboardLayout>,
		);

		// Should show global nav items
		expect(screen.getByText("Agents")).toBeInTheDocument();
		expect(screen.getByText("Usage")).toBeInTheDocument();

		// Content
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("renders agent navigation when agent is selected", () => {
		// Mock current agent
		vi.mocked(AgentHook.useAgent).mockReturnValue({
			agents: [{ _id: "agent-1", name: "Test Agent", organizationId: "org-1" }],
			currentAgent: {
				_id: "agent-1",
				name: "Test Agent",
				organizationId: "org-1",
			},
			isLoading: false,
			showAgentSidebar: true,
		} as any);

		renderWithProviders(
			<DashboardLayout>
				<div>Agent Content</div>
			</DashboardLayout>,
		);

		// Should show agent name in sidebar
		expect(screen.getAllByText("Test Agent")[0]).toBeInTheDocument();

		// Should show agent nav items
		expect(screen.getByText("Chat Playground")).toBeInTheDocument();
		expect(screen.getByText("Sources")).toBeInTheDocument();
	});
});
