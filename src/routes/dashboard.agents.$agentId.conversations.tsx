import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Download,
	Filter,
	MessageSquare,
	RefreshCw,
	Trash,
	ChevronRight,
	Clock,
	Terminal
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";
import { Button } from "../components/ui/button";
import { ContentCardEmpty } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import { Badge } from "../components/ui/badge";

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
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" className="hidden sm:flex">
						<RefreshCw className="h-3.5 w-3.5 mr-2" />
						Refresh
					</Button>
					<Button variant="outline" size="sm" className="hidden sm:flex">
						<Filter className="h-3.5 w-3.5 mr-2" />
						Filter
					</Button>
					<Button size="sm">
						<Download className="h-3.5 w-3.5 mr-2" />
						Export Data
					</Button>
				</div>
			</PageHeader>

			{conversations === undefined ? (
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[750px]">
						<div className="bg-muted/10 rounded-2xl border border-border/40" />
						<div className="lg:col-span-3 bg-muted/10 rounded-2xl border border-border/40" />
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
				<div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[600px]">
					{/* Conversations List */}
					<div className="w-full lg:w-80 flex flex-col bg-card/30 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-sm">
						<div className="p-4 border-b border-border/40 bg-muted/20">
							<h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
								<Clock className="h-3.5 w-3.5" />
								History
							</h3>
						</div>
						<div className="overflow-y-auto flex-1 custom-scrollbar">
							{conversations.map((conversation, index) => {
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
									timeDisplay = `${diffInMinutes}m ago`;
								} else if (diffInHours < 24) {
									timeDisplay = `${diffInHours}h ago`;
								} else {
									timeDisplay = `${diffInDays}d ago`;
								}

								return (
									<div
										key={conversation._id}
										onClick={() => setCurrentConversationId(conversation._id)}
										className={cn(
											"p-4 border-b border-border/30 cursor-pointer transition-all duration-200 group relative animate-fade-in-right",
											isSelected
												? "bg-primary/[0.03]"
												: "hover:bg-muted/30",
											index < 10 ? `stagger-${(index % 5) + 1}` : ""
										)}
									>
										{isSelected && (
											<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-lg shadow-primary/40" />
										)}
										<div className="flex justify-between items-start mb-1.5">
											<p className={cn(
												"text-sm font-bold truncate pr-6 transition-colors",
												isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
											)}>
												{conversation.title || "New Session"}
											</p>
											<span className="text-[10px] font-semibold text-muted-foreground/60 whitespace-nowrap pt-0.5">
												{timeDisplay}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-[9px] bg-background/50 border-border/40">
												{isSelected ? "Open" : "Archived"}
											</Badge>
											<div className="flex items-center text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight">
												<Terminal className="h-2.5 w-2.5 mr-1" />
												Playground
											</div>
										</div>

										<button
											onClick={(e) => {
												e.stopPropagation();
												// TODO: Implement delete
											}}
											className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
										>
											<Trash className="h-3.5 w-3.5" />
										</button>
									</div>
								);
							})}
						</div>
					</div>

					{/* Conversation Content */}
					<div className="flex-1 flex flex-col bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-xl shadow-black/5">
						{currentConversationId ? (
							<div className="h-full flex flex-col animate-fade-in">
								<div className="bg-muted/20 px-6 py-4 border-b border-border/40">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
												<MessageSquare className="h-5 w-5 text-primary" />
											</div>
											<div>
												<h4 className="text-base font-bold text-foreground flex items-center gap-2">
													{conversations.find(
														(c) => c._id === currentConversationId,
													)?.title || "Untitled Session"}
													<Badge variant="success" className="h-4">Live</Badge>
												</h4>
												<div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-medium">
													<Clock className="h-3 w-3" />
													Started {new Date(
														conversations.find(
															(c) => c._id === currentConversationId,
														)?._creationTime || 0,
													).toLocaleString(undefined, {
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm" className="h-8 text-xs">
												<Download className="h-3 w-3 mr-2" />
												Transcript
											</Button>
											<Button variant="destructive" size="sm" className="h-8 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive border-transparent">
												<Trash className="h-3 w-3 mr-2" />
												Delete
											</Button>
										</div>
									</div>
								</div>
								<div className="flex-1 overflow-hidden relative">
									<ChatWidget
										agentId={agent._id as any}
										conversationId={currentConversationId}
										onConversationCreate={handleConversationCreate}
										height="100%"
										className="border-0 h-full"
									/>
									<div className="absolute inset-0 pointer-events-none border border-primary/5 rounded-none" />
								</div>
							</div>
						) : (
							<div className="h-full flex items-center justify-center p-12 text-center animate-pulse">
								<div className="max-w-xs">
									<div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border/40">
										<MessageSquare className="h-8 w-8 text-muted-foreground/30" />
									</div>
									<h3 className="text-lg font-bold text-foreground mb-2">Select a Session</h3>
									<p className="text-sm text-muted-foreground leading-relaxed font-medium">
										Choose a conversation from the sidebar to view the transcript and interactive replay.
									</p>
									<div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
										<ChevronRight className="h-3 w-3" />
										Choose from 24 active logs
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</PageLayout>
	);
}
