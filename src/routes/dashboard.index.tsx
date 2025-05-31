import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardOverview,
});

function DashboardOverview() {
	// Fetch real data from Convex
	const agents = useQuery(api.agents.getAgentsForUser);
	const conversations = useQuery(api.conversations.getConversationsForUser);
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForUser);
	const messages = useQuery(api.conversations.getMessagesForUser);

	// Calculate stats
	const agentCount = agents?.length ?? 0;
	const conversationCount = conversations?.length ?? 0;
	const knowledgeCount = knowledgeEntries?.length ?? 0;
	const messageCount = messages?.length ?? 0;

	// Loading state
	const isLoading =
		agents === undefined ||
		conversations === undefined ||
		knowledgeEntries === undefined ||
		messages === undefined;

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="border-b border-gray-200 pb-4">
				<h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
				<p className="mt-1 text-sm text-gray-600">
					Welcome to your AI Agent Platform. Manage your agents, conversations,
					and knowledge base.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
									<span className="text-white text-sm font-medium">A</span>
								</div>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Total Agents
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{isLoading ? (
											<div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
										) : (
											agentCount
										)}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
									<span className="text-white text-sm font-medium">C</span>
								</div>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Conversations
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{isLoading ? (
											<div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
										) : (
											conversationCount
										)}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
									<span className="text-white text-sm font-medium">K</span>
								</div>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Knowledge Entries
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{isLoading ? (
											<div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
										) : (
											knowledgeCount
										)}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
									<span className="text-white text-sm font-medium">M</span>
								</div>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">
										Messages
									</dt>
									<dd className="text-lg font-medium text-gray-900">
										{isLoading ? (
											<div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
										) : (
											messageCount
										)}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Getting Started */}
			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
				</div>
				<div className="p-6">
					<div className="space-y-4">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center ${
										agentCount > 0 ? "bg-green-100" : "bg-blue-100"
									}`}
								>
									<span
										className={`text-sm font-medium ${
											agentCount > 0 ? "text-green-600" : "text-blue-600"
										}`}
									>
										{agentCount > 0 ? "✓" : "1"}
									</span>
								</div>
							</div>
							<div className="ml-3">
								<h3
									className={`text-sm font-medium ${
										agentCount > 0 ? "text-green-900" : "text-gray-900"
									}`}
								>
									{agentCount > 0
										? "Agent created!"
										: "Create your first agent"}
								</h3>
								<p className="text-sm text-gray-600">
									{agentCount > 0
										? `You have ${agentCount} agent${agentCount === 1 ? "" : "s"} ready to use.`
										: "Set up an AI agent with a name and description."}
								</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="flex-shrink-0">
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center ${
										knowledgeCount > 0 ? "bg-green-100" : "bg-gray-100"
									}`}
								>
									<span
										className={`text-sm font-medium ${
											knowledgeCount > 0 ? "text-green-600" : "text-gray-600"
										}`}
									>
										{knowledgeCount > 0 ? "✓" : "2"}
									</span>
								</div>
							</div>
							<div className="ml-3">
								<h3
									className={`text-sm font-medium ${
										knowledgeCount > 0 ? "text-green-900" : "text-gray-900"
									}`}
								>
									{knowledgeCount > 0 ? "Knowledge added!" : "Add knowledge"}
								</h3>
								<p className="text-sm text-gray-600">
									{knowledgeCount > 0
										? `You have ${knowledgeCount} knowledge entr${knowledgeCount === 1 ? "y" : "ies"}.`
										: "Upload documents or add text to train your agent."}
								</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="flex-shrink-0">
								<div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
									<span className="text-gray-600 text-sm font-medium">3</span>
								</div>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-gray-900">
									Deploy and embed
								</h3>
								<p className="text-sm text-gray-600">
									Get the embed code to add your agent to your website.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
