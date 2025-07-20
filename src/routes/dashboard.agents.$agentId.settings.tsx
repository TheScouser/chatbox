import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/agents/$agentId/settings")({
	component: AgentSettingsLayout,
});

function AgentSettingsLayout() {
	return <Outlet />;
}
