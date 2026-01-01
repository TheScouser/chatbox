import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, Settings } from "lucide-react";
import { api } from "../../convex/_generated/api";
import AISettings from "../components/AISettings";

export const Route = createFileRoute("/dashboard/agents/$agentId/settings/ai")({
	component: AgentAISettings,
});

function AgentAISettings() {
	const { agentId } = Route.useParams();

	// Get agent data
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	if (agents === undefined) {
		return (
			<div className="animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
				<div className="h-96 bg-gray-200 rounded" />
			</div>
		);
	}

	if (!agent) {
		return (
			<div className="text-center py-12">
				<Settings className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-sm font-medium text-gray-900">
					Agent not found
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					The agent you're looking for doesn't exist.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 flex items-center">
					<Bot className="h-6 w-6 mr-2" />
					AI Settings
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Configure the AI model and instructions for your agent.
				</p>
			</div>

			<AISettings agent={agent} />
		</div>
	);
}
