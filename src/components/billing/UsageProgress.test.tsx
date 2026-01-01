import { renderWithProviders } from "@/test/render";
import { screen } from "@testing-library/react";
import { useQuery } from "convex/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsageProgress } from "./UsageProgress";

vi.mock("convex/react");

describe("UsageProgress", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("shows counts and Normal badge under 75%", async () => {
		vi.mocked(useQuery).mockImplementationOnce(
			() =>
				({
					allowed: true,
					current: 30,
					max: 100,
				}) as any,
		);

		renderWithProviders(
			<UsageProgress
				metric="messages"
				title="Messages"
				description="This month"
			/>,
		);

		expect(await screen.findByText("30 used")).toBeInTheDocument();
		expect(screen.getByText("100 limit")).toBeInTheDocument();
		expect(screen.getByText("Normal")).toBeInTheDocument();
	});

	it("shows Warning badge between 75% and 90%", async () => {
		vi.mocked(useQuery).mockImplementationOnce(
			() =>
				({
					allowed: true,
					current: 80,
					max: 100,
				}) as any,
		);

		renderWithProviders(<UsageProgress metric="files" title="Files" />);

		expect(await screen.findByText("Warning")).toBeInTheDocument();
		expect(screen.getByText("80.0% used")).toBeInTheDocument();
	});

	it("shows Critical badge at 90%+ and limit exceeded notice when blocked", async () => {
		vi.mocked(useQuery).mockImplementationOnce(
			() =>
				({
					allowed: false,
					current: 95,
					max: 100,
				}) as any,
		);

		renderWithProviders(<UsageProgress metric="agents" title="Agents" />);

		expect(await screen.findByText("Critical")).toBeInTheDocument();
		expect(
			screen.getByText("Limit exceeded. Upgrade your plan to continue."),
		).toBeInTheDocument();
	});
});
