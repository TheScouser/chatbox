import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";

export const Route = createFileRoute("/dashboard/agents/$agentId/conversations")({
	component: AgentConversations,
});

function AgentConversations() {
	const { agentId } = Route.useParams();
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);

	// Get agent data
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);
	const conversations = useQuery(api.conversations.getConversationsForAgent, {
		agentId: agentId as any,
	});

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

	if (agents === undefined) {
		return (
			<div className="animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
				<div className="h-96 bg-gray-200 rounded"></div>
			</div>
		);
	}

	if (!agent) {
		return (
			<div className="text-center py-12">
				<MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
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
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-2xl font-bold text-gray-900">
						Conversations
					</h3>
					<p className="mt-1 text-gray-600">
						View and manage all conversations with your agent.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
						<svg
							className="h-4 w-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Refresh
					</button>
					<button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
						<svg
							className="h-4 w-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
							/>
						</svg>
						Filter
					</button>
					<button className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
						<svg
							className="h-4 w-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Export
					</button>
				</div>
			</div>

			{conversations === undefined ? (
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
						<div className="bg-gray-100 rounded-lg"></div>
						<div className="lg:col-span-3 bg-gray-100 rounded-lg"></div>
					</div>
				</div>
			) : conversations.length === 0 ? (
				<div className="text-center py-16">
					<MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
					<h3 className="mt-4 text-lg font-medium text-gray-900">
						No conversations yet
					</h3>
					<p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
						Conversations will appear here once users start chatting
						with your agent.
					</p>
					<div className="mt-8">
						<button
							onClick={() => window.location.href = `/dashboard/agents/${agentId}/chat`}
							className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							<MessageSquare className="mr-2 h-4 w-4" />
							Test Your Agent
						</button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
					{/* Conversations List */}
					<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
						<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
							<h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
								<MessageSquare className="h-5 w-5 text-purple-600" />
								Chat Logs
							</h4>
						</div>
						<div className="overflow-y-auto h-full">
							{conversations.map((conversation, index) => {
								const isSelected =
									currentConversationId === conversation._id;
								const timeAgo = new Date(
									conversation._creationTime,
								);
								const now = new Date();
								const diffInMinutes = Math.floor(
									(now.getTime() - timeAgo.getTime()) / (1000 * 60),
								);
								const diffInHours = Math.floor(diffInMinutes / 60);
								const diffInDays = Math.floor(diffInHours / 24);

								let timeDisplay = "";
								if (diffInMinutes < 60) {
									timeDisplay = `${diffInMinutes} minutes ago`;
								} else if (diffInHours < 24) {
									timeDisplay = `${diffInHours} hours ago`;
								} else {
									timeDisplay = `${diffInDays} days ago`;
								}

								return (
									<div
										key={conversation._id}
										onClick={() =>
											setCurrentConversationId(conversation._id)
										}
										className={`p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected
												? "bg-blue-50 border-l-4 border-l-blue-500"
												: ""
											}`}
									>
										<div className="flex justify-between items-start mb-3">
											<p className="text-sm font-medium text-gray-900 truncate pr-2 leading-relaxed">
												{conversation.title ||
													"Untitled Conversation"}
											</p>
											<button
												onClick={(e) => {
													e.stopPropagation();
													// TODO: Implement delete
													console.log(
														"Delete conversation:",
														conversation._id,
													);
												}}
												className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
											>
												<svg
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
										<p className="text-xs text-gray-500 mb-3">
											{timeDisplay}
										</p>
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												Source: Playground
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Conversation Content */}
					<div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
						{currentConversationId ? (
							<div className="h-full flex flex-col">
								<div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xl font-medium text-gray-900">
												{conversations.find(
													(c) => c._id === currentConversationId,
												)?.title || "Conversation Details"}
											</h4>
											<p className="text-sm text-gray-500 mt-1">
												Started{" "}
												{new Date(
													conversations.find(
														(c) => c._id === currentConversationId,
													)?._creationTime || 0,
												).toLocaleString()}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Active
											</span>
										</div>
									</div>
								</div>
								<div className="flex-1 overflow-hidden">
									<ChatWidget
										agentId={agent._id as any}
										conversationId={currentConversationId}
										onConversationCreate={handleConversationCreate}
										height="100%"
										className="border-0 h-full"
									/>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center justify-center">
								<div className="text-center">
									<MessageSquare className="mx-auto h-20 w-20 text-gray-400" />
									<h3 className="mt-6 text-xl font-medium text-gray-900">
										Select a conversation
									</h3>
									<p className="mt-3 text-sm text-gray-500 max-w-sm">
										Choose a conversation from the list to view its
										details and chat history.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
} 