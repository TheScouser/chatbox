import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowLeft,
	BookOpen,
	Bot,
	Brain,
	MessageSquare,
	Globe,
	Settings,
} from "lucide-react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/agents/$agentId")({
	component: AgentLayout,
});

function AgentLayout() {
	return <Outlet />;
}
