import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/agents/$agentId/")({
	beforeLoad: ({ params }) => {
		// Redirect overview page to knowledge page
		throw redirect({
			to: "/dashboard/agents/$agentId/knowledge" as any,
			params: { agentId: params.agentId },
			replace: true,
		});
	},
});