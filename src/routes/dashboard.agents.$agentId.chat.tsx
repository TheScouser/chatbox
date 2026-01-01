import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { BotMessageSquareIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";

export const Route = createFileRoute("/dashboard/agents/$agentId/chat")({
	component: AgentChat,
});

function AgentChat() {
	const { agentId } = Route.useParams();
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);

	// Get agent data
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

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
				<BotMessageSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
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
				<h3 className="text-2xl font-bold text-gray-900">Chat Playground</h3>
				<p className="mt-1 text-gray-600">
					Test your agent by chatting with it directly. This is exactly how
					customers will interact with your agent when deployed.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<ChatWidget
						agentId={agent._id as any}
						conversationId={currentConversationId}
						onConversationCreate={handleConversationCreate}
						height="700px"
						className="border border-gray-200 rounded-lg"
					/>
				</div>

				<div className="space-y-4">
					{currentConversationId && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<h4 className="text-sm font-medium text-green-800 mb-2">
								Active Conversation
							</h4>
							<p className="text-xs text-green-700">
								Conversation ID: {currentConversationId}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
