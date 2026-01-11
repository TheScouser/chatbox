import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAction, useQuery } from "convex/react";
import { Bot, Loader2, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatWidgetProps {
	agentId: Id<"agents">;
	conversationId?: Id<"conversations">;
	onConversationCreate?: (conversationId: Id<"conversations">) => void;
	className?: string;
	height?: string;
	locale?: string;
}

interface Message {
	_id: Id<"messages">;
	_creationTime: number;
	role: "user" | "assistant";
	content: string;
	metadata?: {
		userId?: string;
		model?: string;
		tokensUsed?: number;
		knowledgeUsed?: number;
		error?: string;
	};
}

export default function ChatWidget({
	agentId,
	conversationId,
	onConversationCreate,
	className = "",
	height = "600px",
	locale,
}: ChatWidgetProps) {
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Get agent details
	const agent = useQuery(api.agents.getAgentById, { agentId });

	// Get messages for the conversation
	const messages = useQuery(
		api.conversations.getMessagesForConversation,
		conversationId ? { conversationId } : "skip",
	) as Message[] | undefined;

	// Actions
	const startConversation = useAction(api.chat.startConversation);
	const generateAIResponse = useAction(api.chat.generateAIResponse);

	// Auto-scroll to bottom when new messages arrive
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger on messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!message.trim()) return;

		const userMessage = message.trim();
		setMessage("");
		setIsLoading(true);

		try {
			let currentConversationId = conversationId;

			// Create conversation if it doesn't exist
			if (!currentConversationId) {
				const result = await startConversation({
					agentId,
					initialMessage: userMessage,
				});
				currentConversationId = result.conversationId;
				if (currentConversationId) {
					onConversationCreate?.(currentConversationId);

					// Generate AI response for the initial message
					await generateAIResponse({
						conversationId: currentConversationId,
						userMessage,
						locale,
					});
				}
			} else {
				// Generate AI response for existing conversation
				await generateAIResponse({
					conversationId: currentConversationId,
					userMessage,
					locale,
				});
			}
		} catch (error) {
			console.error("Error sending message:", error);
			// You might want to show an error toast here
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Card className={`flex flex-col ${className}`} style={{ height }}>
			{/* Header */}
			<CardHeader className="flex-shrink-0 pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<Bot className="h-5 w-5 text-blue-600" />
					{agent?.name || "AI Assistant"}
					{conversationId && (
						<Badge variant="secondary" className="ml-auto">
							<MessageSquare className="h-3 w-3 mr-1" />
							Active
						</Badge>
					)}
				</CardTitle>
				{agent?.description && (
					<p className="text-sm text-muted-foreground">{agent.description}</p>
				)}
			</CardHeader>

			{/* Messages */}
			<CardContent className="flex-1 flex flex-col min-h-0 p-0">
				<ScrollArea
					className="flex-1 px-4"
					style={{ maxHeight: "calc(100% - 80px)" }}
				>
					<div className="space-y-4 py-4 min-h-full">
						{!conversationId && !messages?.length && (
							<div className="text-center py-8">
								<Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium text-muted-foreground mb-2">
									Start a conversation
								</h3>
								<p className="text-sm text-muted-foreground">
									Send a message to begin chatting with{" "}
									{agent?.name || "the AI assistant"}
								</p>
							</div>
						)}

						{messages?.map((msg) => (
							<div
								key={msg._id}
								className={`flex gap-3 ${
									msg.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								{msg.role === "assistant" && (
									<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<Bot className="h-4 w-4 text-blue-600" />
									</div>
								)}

								<div
									className={`max-w-[75%] rounded-lg px-4 py-2 ${
										msg.role === "user"
											? "bg-blue-600 text-white"
											: "bg-muted text-foreground"
									}`}
								>
									<p className="text-sm whitespace-pre-wrap break-words">
										{msg.content}
									</p>
									<div className="flex items-center justify-between mt-1 gap-2">
										<span
											className={`text-xs ${
												msg.role === "user"
													? "text-blue-100"
													: "text-muted-foreground"
											}`}
										>
											{formatTime(msg._creationTime)}
										</span>
										{msg.metadata?.knowledgeUsed &&
											msg.metadata.knowledgeUsed > 0 && (
												<Badge variant="outline" className="text-xs">
													{msg.metadata.knowledgeUsed} sources
												</Badge>
											)}
									</div>
								</div>

								{msg.role === "user" && (
									<div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
										<User className="h-4 w-4 text-white" />
									</div>
								)}
							</div>
						))}

						{isLoading && (
							<div className="flex gap-3 justify-start">
								<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
									<Bot className="h-4 w-4 text-blue-600" />
								</div>
								<div className="bg-muted rounded-lg px-4 py-2">
									<div className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm text-muted-foreground">
											Thinking...
										</span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Input */}
				<div className="flex-shrink-0 p-4 border-t">
					<div className="flex gap-2">
						<Input
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder={`Message ${agent?.name || "AI Assistant"}...`}
							disabled={isLoading}
							className="flex-1"
						/>
						<Button
							onClick={handleSendMessage}
							disabled={!message.trim() || isLoading}
							size="icon"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
