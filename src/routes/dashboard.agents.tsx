import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/agents")({
	component: AgentsLayout,
});

function AgentsLayout() {
	return <Outlet />;
}
