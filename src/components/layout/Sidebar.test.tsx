import { renderWithProviders } from "@/test/render";
import { screen } from "@testing-library/react";
import { Bot, User } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { type NavItem, Sidebar } from "./Sidebar";

// Mock router
vi.mock("@tanstack/react-router", async () => {
	return {
		Link: (props: any) => (
			<a href={props.to} {...props}>
				{props.children}
			</a>
		),
	};
});

const mockNav: NavItem[] = [
	{ name: "Dashboard", href: "/dashboard", icon: Bot },
	{ name: "Settings", href: "/settings", icon: User },
];

describe("Sidebar", () => {
	it("renders sidebar with title and navigation items", () => {
		renderWithProviders(
			<Sidebar
				title="Test Title"
				subtitle="Test Subtitle"
				navigation={mockNav}
				collapsed={false}
				onToggleCollapse={vi.fn()}
				isNavActive={() => false}
				buildHref={(h) => h}
				expandedSections={{}}
				onToggleSection={vi.fn()}
			/>,
		);

		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it("collapses correctly", () => {
		renderWithProviders(
			<Sidebar
				title="Test Title"
				subtitle="Test Subtitle"
				navigation={mockNav}
				collapsed={true} // Collapsed
				onToggleCollapse={vi.fn()}
				isNavActive={() => false}
				buildHref={(h) => h}
				expandedSections={{}}
				onToggleSection={vi.fn()}
			/>,
		);

		// Title should be hidden (or not present)
		expect(screen.queryByText("Test Title")).not.toBeInTheDocument();

		// Icons should still be present (checked via role or class, but here we assume icons render)
	});
});
