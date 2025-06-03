import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowLeft,
	BookOpen,
	Bot,
	Brain,
	MessageSquare,
	Globe,
} from "lucide-react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/agents/$agentId/")({
	component: AgentOverview,
});

function AgentOverview() {
	const navigate = useNavigate();
	const { agentId } = Route.useParams();

	// Get agent data
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	// Get real statistics for the overview
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const conversations = useQuery(api.conversations.getConversationsForAgent, {
		agentId: agentId as any,
	});
	const knowledgeStats = useQuery(api.vectorSearch.getKnowledgeStats, {
		agentId: agentId as any,
	});

	if (agents === undefined) {
		return (
			<div className="animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
				<div className="h-64 bg-gray-200 rounded"></div>
			</div>
		);
	}

	if (!agent) {
		return (
			<div className="text-center py-12">
				<Bot className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-sm font-medium text-gray-900">
					Agent not found
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					The agent you're looking for doesn't exist or you don't have
					access to it.
				</p>
				<div className="mt-6">
					<button
						onClick={() => navigate({ to: "/dashboard/agents" })}
						className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Agents
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Agent Header */}
			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-6">
					<div className="flex items-center">
						<div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-6">
							<Bot className="h-8 w-8 text-blue-600" />
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold text-gray-900">
								{agent.name}
							</h1>
							<p className="text-lg text-gray-600 mt-2">
								{agent.description || "No description provided"}
							</p>
							<p className="text-sm text-gray-500 mt-2">
								Created {new Date(agent._creationTime).toLocaleDateString()}{" "}
								• Last updated{" "}
								{new Date(agent._creationTime).toLocaleDateString()}
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
								Active
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div className="bg-white shadow rounded-lg p-6">
					<div className="flex items-center">
						<BookOpen className="h-10 w-10 text-blue-500" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Knowledge Entries
							</p>
							<p className="text-3xl font-semibold text-gray-900">
								{knowledgeEntries?.length || 0}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white shadow rounded-lg p-6">
					<div className="flex items-center">
						<MessageSquare className="h-10 w-10 text-green-500" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Conversations
							</p>
							<p className="text-3xl font-semibold text-gray-900">
								{conversations?.length || 0}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white shadow rounded-lg p-6">
					<div className="flex items-center">
						<Brain className="h-10 w-10 text-purple-500" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Training Progress
							</p>
							<p className="text-3xl font-semibold text-gray-900">
								{knowledgeStats
									? Math.round(knowledgeStats.embeddingProgress)
									: 0}
								%
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Training Status */}
			{knowledgeStats && (
				<div className="bg-white shadow rounded-lg p-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Knowledge Base Status
					</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{knowledgeStats.totalEntries}
							</div>
							<div className="text-sm text-gray-500">
								Total Sources
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{knowledgeStats.entriesWithEmbeddings}
							</div>
							<div className="text-sm text-gray-500">Trained</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">
								{knowledgeStats.entriesNeedingEmbeddings}
							</div>
							<div className="text-sm text-gray-500">
								Need Training
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{Math.round(knowledgeStats.embeddingProgress)}%
							</div>
							<div className="text-sm text-gray-500">Complete</div>
						</div>
					</div>
					{knowledgeStats.entriesNeedingEmbeddings > 0 && (
						<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
							<p className="text-sm text-orange-800">
								<strong>Action needed:</strong>{" "}
								{knowledgeStats.entriesNeedingEmbeddings} knowledge
								sources need training. Go to the Knowledge Base section
								and click "Train Agent" to improve response quality.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Quick Actions */}
			<div className="bg-white shadow rounded-lg p-6">
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<button
						onClick={() => navigate({ to: `/dashboard/agents/${agentId}/chat` })}
						className="text-left p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
					>
						<MessageSquare className="h-6 w-6 text-green-500 mb-2" />
						<h4 className="font-medium text-gray-900">
							Test Agent
						</h4>
						<p className="text-sm text-gray-600">
							Chat with your agent in the playground
						</p>
					</button>
					<button
						onClick={() => navigate({ to: `/dashboard/agents/${agentId}/knowledge` })}
						className="text-left p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
					>
						<BookOpen className="h-6 w-6 text-blue-500 mb-2" />
						<h4 className="font-medium text-gray-900">
							Add Knowledge
						</h4>
						<p className="text-sm text-gray-600">
							Upload documents or add text content
						</p>
					</button>
					<button
						onClick={() => navigate({ to: `/dashboard/agents/${agentId}/deploy` })}
						className="text-left p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
					>
						<Globe className="h-6 w-6 text-purple-500 mb-2" />
						<h4 className="font-medium text-gray-900">
							Deploy Agent
						</h4>
						<p className="text-sm text-gray-600">
							Get embed code for your website
						</p>
					</button>
				</div>
			</div>
		</div>
	);
} 