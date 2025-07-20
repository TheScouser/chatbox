import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/agents/$agentId/knowledge")({
	component: AgentKnowledgeLayout,
});

function AgentKnowledgeLayout() {
	return <Outlet />;
}
