import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ChatWidget from "../components/ChatWidget";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Zap } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/demo/chat")({
	component: ChatDemo,
});

function ChatDemo() {
	const [selectedAgentId, setSelectedAgentId] = useState<string>("");
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>();

	// Get user's agents
	const agents = useQuery(api.agents.getAgentsForUser);

	// Get conversations for selected agent
	const conversations = useQuery(
		api.conversations.getConversationsForAgent,
		selectedAgentId ? { agentId: selectedAgentId as any } : "skip",
	);

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

	const startNewConversation = () => {
		setCurrentConversationId(undefined);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">Chat Interface Demo</h1>
				<p className="text-muted-foreground">
					Test the AI chat functionality with knowledge-based responses
				</p>
			</div>

			{/* Agent Selection */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bot className="h-5 w-5" />
						Select Agent
					</CardTitle>
					<CardDescription>Choose an agent to chat with</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						{agents?.map((agent) => (
							<Button
								key={agent._id}
								variant={selectedAgentId === agent._id ? "default" : "outline"}
								onClick={() => {
									setSelectedAgentId(agent._id);
									setCurrentConversationId(undefined); // Reset conversation when switching agents
								}}
								className="justify-start h-auto p-4"
							>
								<div className="text-left">
									<div className="font-medium">{agent.name}</div>
									{agent.description && (
										<div className="text-sm text-muted-foreground mt-1">
											{agent.description}
										</div>
									)}
								</div>
							</Button>
						))}
					</div>

					{!agents?.length && (
						<p className="text-muted-foreground text-center py-4">
							No agents found. Create an agent first in the dashboard.
						</p>
					)}
				</CardContent>
			</Card>

			{/* Conversation Management */}
			{selectedAgentId && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MessageSquare className="h-5 w-5" />
							Conversations
						</CardTitle>
						<CardDescription>
							Manage conversations with this agent
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2">
							<Button onClick={startNewConversation} variant="outline">
								<Zap className="h-4 w-4 mr-2" />
								Start New Conversation
							</Button>
							{currentConversationId && (
								<Badge variant="secondary">Active conversation</Badge>
							)}
						</div>

						{conversations && conversations.length > 0 && (
							<div className="space-y-2">
								<h4 className="text-sm font-medium">Previous Conversations:</h4>
								<div className="grid gap-2">
									{conversations.slice(0, 5).map((conversation) => (
										<Button
											key={conversation._id}
											variant={
												currentConversationId === conversation._id
													? "default"
													: "outline"
											}
											onClick={() => setCurrentConversationId(conversation._id)}
											className="justify-start h-auto p-3"
											size="sm"
										>
											<div className="text-left">
												<div className="text-sm font-medium">
													{conversation.title}
												</div>
												<div className="text-xs text-muted-foreground">
													{new Date(
														conversation._creationTime,
													).toLocaleString()}
												</div>
											</div>
										</Button>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Chat Widget */}
			{selectedAgentId && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<ChatWidget
							agentId={selectedAgentId as any}
							conversationId={currentConversationId}
							onConversationCreate={handleConversationCreate}
							height="700px"
						/>
					</div>

					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Chat Features</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="space-y-2">
									<h4 className="text-sm font-medium">✨ What's Working:</h4>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Real-time message updates</li>
										<li>• Knowledge-based AI responses</li>
										<li>• Vector search integration</li>
										<li>• Conversation persistence</li>
										<li>• Auto-scroll to new messages</li>
										<li>• Loading states & error handling</li>
									</ul>
								</div>

								<div className="space-y-2">
									<h4 className="text-sm font-medium">🧪 Test Ideas:</h4>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Ask about your knowledge entries</li>
										<li>• Try different conversation topics</li>
										<li>• Test with multiple agents</li>
										<li>• Check conversation history</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Debug Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="text-sm">
									<strong>Selected Agent:</strong> {selectedAgentId || "None"}
								</div>
								<div className="text-sm">
									<strong>Conversation:</strong>{" "}
									{currentConversationId || "None"}
								</div>
								<div className="text-sm">
									<strong>Total Conversations:</strong>{" "}
									{conversations?.length || 0}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{!selectedAgentId && (
				<div className="text-center py-12">
					<Bot className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-xl font-medium text-muted-foreground mb-2">
						Select an Agent to Start Chatting
					</h3>
					<p className="text-muted-foreground">
						Choose an agent from the list above to begin testing the chat
						interface
					</p>
				</div>
			)}
		</div>
	);
}
