import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, ExternalLink } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";

export const Route = createFileRoute("/chat/$agentId")({
	component: PublicChat,
});

function PublicChat() {
	const { agentId } = Route.useParams();
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);

	// Get agent details
	const agent = useQuery(api.agents.getAgentById, {
		agentId: agentId as Id<"agents">,
	});

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

	if (!agent) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Agent not found
					</h2>
					<p className="text-gray-600">
						The agent you're looking for doesn't exist or is not available.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Bot className="h-8 w-8 text-blue-600" />
							<div>
								<h1 className="text-xl font-semibold text-gray-900">
									{agent.name}
								</h1>
								{agent.description && (
									<p className="text-sm text-gray-600">{agent.description}</p>
								)}
							</div>
						</div>
						<div className="text-xs text-gray-500 flex items-center gap-1">
							<span>Powered by AI</span>
							<ExternalLink className="h-3 w-3" />
						</div>
					</div>
				</div>
			</div>

			{/* Chat Container */}
			<div className="max-w-4xl mx-auto px-4 py-6">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<ChatWidget
						agentId={agentId as Id<"agents">}
						conversationId={currentConversationId}
						onConversationCreate={handleConversationCreate}
						height="600px"
						className="border-0 shadow-none"
					/>
				</div>
			</div>

			{/* Footer */}
			<div className="text-center py-4 text-xs text-gray-500">
				This AI assistant is powered by advanced language models and may
				occasionally provide inaccurate information.
			</div>
		</div>
	);
}
