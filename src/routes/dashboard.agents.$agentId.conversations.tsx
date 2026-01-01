import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Download,
	Filter,
	MessageSquare,
	RefreshCw,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";
import { Button } from "../components/ui/button";
import { ContentCard, ContentCardEmpty } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/conversations",
)({
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
				<div className="h-8 bg-muted/40 rounded w-1/4 mb-4" />
				<div className="h-96 bg-muted/40 rounded" />
			</div>
		);
	}

	if (!agent) {
		return (
			<PageLayout>
				<ContentCardEmpty
					icon={MessageSquare}
					title="Agent not found"
					description="The agent you're looking for doesn't exist."
				/>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<PageHeader
				title="Conversations"
				description="View and manage all conversations with your agent."
			>
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
					<Button variant="outline" size="sm">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>
			</PageHeader>

			{conversations === undefined ? (
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
						<div className="bg-muted/20 rounded-lg" />
						<div className="lg:col-span-3 bg-muted/20 rounded-lg" />
					</div>
				</div>
			) : conversations.length === 0 ? (
				<ContentCardEmpty
					icon={MessageSquare}
					title="No conversations yet"
					description="Conversations will appear here once users start chatting with your agent."
				>
					<Button
						onClick={() =>
							(window.location.href = `/dashboard/agents/${agentId}/chat`)
						}
					>
						<MessageSquare className="mr-2 h-4 w-4" />
						Test Your Agent
					</Button>
				</ContentCardEmpty>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
					{/* Conversations List */}
					<ContentCard title="Chat Logs" className="overflow-hidden">
						<div className="overflow-y-auto h-full">
							{conversations.map((conversation) => {
								const isSelected = currentConversationId === conversation._id;
								const timeAgo = new Date(conversation._creationTime);
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
										onClick={() => setCurrentConversationId(conversation._id)}
										className={`p-5 border-b border-border cursor-pointer hover:bg-accent/50 transition-all duration-200 ${isSelected
												? "bg-accent border-l-4 border-l-primary"
												: "border-l-4 border-l-transparent"
											}`}
									>
										<div className="flex justify-between items-start mb-3">
											<p className="text-sm font-medium text-foreground truncate pr-2 leading-relaxed">
												{conversation.title || "Untitled Conversation"}
											</p>
											<Button
												size="sm"
												variant="ghost"
												onClick={(e) => {
													e.stopPropagation();
													// TODO: Implement delete
													console.log("Delete conversation:", conversation._id);
												}}
												className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-1 h-auto"
											>
												<Trash className="h-4 w-4" />
											</Button>
										</div>
										<p className="text-xs text-muted-foreground mb-3">{timeDisplay}</p>
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
												Source: Playground
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</ContentCard>

					{/* Conversation Content */}
					<ContentCard
						title="Conversation Details"
						className="lg:col-span-3 overflow-hidden"
					>
						{currentConversationId ? (
							<div className="h-full flex flex-col">
								<div className="bg-muted/30 px-6 py-5 border-b border-border">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-xl font-medium text-foreground">
												{conversations.find(
													(c) => c._id === currentConversationId,
												)?.title || "Conversation Details"}
											</h4>
											<p className="text-sm text-muted-foreground mt-1">
												Started{" "}
												{new Date(
													conversations.find(
														(c) => c._id === currentConversationId,
													)?._creationTime || 0,
												).toLocaleString()}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
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
								<ContentCardEmpty
									icon={MessageSquare}
									title="Select a conversation"
									description="Choose a conversation from the list to view its details and chat history."
								/>
							</div>
						)}
					</ContentCard>
				</div>
			)}
		</PageLayout>
	);
}
