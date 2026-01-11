import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/agents/$agentId/")({
	beforeLoad: () => {
		// Redirect overview page to knowledge page
		throw redirect({
			// biome-ignore lint/suspicious/noExplicitAny: TanStack Router requires type assertion for route paths
			to: "/dashboard/agents/$agentId/knowledge" as any,
			replace: true,
		});
	},
});
