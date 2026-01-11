import { useAction, useMutation } from "convex/react";
import { MessageSquare, Minimize2, Send, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { detectUserLocale } from "../lib/locale";

interface ChatBubbleWidgetProps {
	agentId: string;
	apiUrl?: string;
	primaryColor?: string;
	position?: "bottom-right" | "bottom-left";
	offset?: { x: number; y: number };
}

interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	timestamp: number;
}

export default function ChatBubbleWidget({
	agentId,
	// apiUrl = window.location.origin,
	primaryColor = "#2563eb",
	position = "bottom-right",
	offset = { x: 20, y: 20 },
}: ChatBubbleWidgetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] =
		useState<Id<"conversations"> | null>(null);
	const [detectedLocale] = useState(() => detectUserLocale());
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Convex hooks
	const generateAIResponse = useAction(api.chat.generateAIResponse);
	const createConversation = useMutation(api.conversations.createConversation);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const sendMessage = async (content: string) => {
		if (!content.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content,
			role: "user",
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsLoading(true);

		try {
			// Create conversation if it doesn't exist
			let currentConversationId = conversationId;
			if (!currentConversationId) {
				currentConversationId = await createConversation({
					agentId: agentId as Id<"agents">,
					title: `Chat - ${new Date().toLocaleString()}`,
				});
				setConversationId(currentConversationId);
			}

			// Send message using Convex
			const response = await generateAIResponse({
				conversationId: currentConversationId,
				userMessage: content,
				locale: detectedLocale,
			});

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: response.content,
				role: "assistant",
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Sorry, I encountered an error. Please try again.",
				role: "assistant",
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage(inputValue);
	};

	const positionStyles = {
		"bottom-right": {
			bottom: offset.y,
			right: offset.x,
		},
		"bottom-left": {
			bottom: offset.y,
			left: offset.x,
		},
	};

	return (
		<div
			style={{
				position: "fixed",
				zIndex: 9999,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				...positionStyles[position],
			}}
		>
			{/* Chat Bubble */}
			{!isOpen && (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					style={{
						width: "60px",
						height: "60px",
						borderRadius: "50%",
						backgroundColor: primaryColor,
						border: "none",
						cursor: "pointer",
						boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transition: "transform 0.2s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = "scale(1.1)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = "scale(1)";
					}}
				>
					<MessageSquare size={24} color="white" />
				</button>
			)}

			{/* Chat Window */}
			{isOpen && (
				<div
					style={{
						width: "350px",
						height: isMinimized ? "60px" : "500px",
						backgroundColor: "white",
						borderRadius: "12px",
						boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
						border: "1px solid #e5e7eb",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						transition: "height 0.3s ease",
					}}
				>
					{/* Header */}
					<div
						style={{
							backgroundColor: primaryColor,
							color: "white",
							padding: "16px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							minHeight: "60px",
							boxSizing: "border-box",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<MessageSquare size={20} />
							<span style={{ fontWeight: "600", fontSize: "14px" }}>
								Chat Assistant
							</span>
						</div>
						<div style={{ display: "flex", gap: "8px" }}>
							<button
								type="button"
								onClick={() => setIsMinimized(!isMinimized)}
								style={{
									background: "none",
									border: "none",
									color: "white",
									cursor: "pointer",
									padding: "4px",
									borderRadius: "4px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Minimize2 size={16} />
							</button>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								style={{
									background: "none",
									border: "none",
									color: "white",
									cursor: "pointer",
									padding: "4px",
									borderRadius: "4px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<X size={16} />
							</button>
						</div>
					</div>

					{!isMinimized && (
						<>
							{/* Messages */}
							<div
								style={{
									flex: 1,
									padding: "16px",
									overflowY: "auto",
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}
							>
								{messages.length === 0 && (
									<div
										style={{
											textAlign: "center",
											color: "#6b7280",
											fontSize: "14px",
											padding: "20px",
										}}
									>
										👋 Hi! How can I help you today?
									</div>
								)}

								{messages.map((message) => (
									<div
										key={message.id}
										style={{
											display: "flex",
											justifyContent:
												message.role === "user" ? "flex-end" : "flex-start",
										}}
									>
										<div
											style={{
												maxWidth: "80%",
												padding: "8px 12px",
												borderRadius: "12px",
												fontSize: "14px",
												lineHeight: "1.4",
												backgroundColor:
													message.role === "user" ? primaryColor : "#f3f4f6",
												color: message.role === "user" ? "white" : "#374151",
											}}
										>
											{message.content}
										</div>
									</div>
								))}

								{isLoading && (
									<div
										style={{ display: "flex", justifyContent: "flex-start" }}
									>
										<div
											style={{
												padding: "8px 12px",
												borderRadius: "12px",
												backgroundColor: "#f3f4f6",
												color: "#6b7280",
												fontSize: "14px",
											}}
										>
											Typing...
										</div>
									</div>
								)}

								<div ref={messagesEndRef} />
							</div>

							{/* Input */}
							<form
								onSubmit={handleSubmit}
								style={{
									padding: "16px",
									borderTop: "1px solid #e5e7eb",
									display: "flex",
									gap: "8px",
								}}
							>
								<input
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									placeholder="Type your message..."
									disabled={isLoading}
									style={{
										flex: 1,
										padding: "8px 12px",
										border: "1px solid #d1d5db",
										borderRadius: "8px",
										fontSize: "14px",
										outline: "none",
										backgroundColor: isLoading ? "#f9fafb" : "white",
									}}
									onFocus={(e) => {
										e.target.style.borderColor = primaryColor;
									}}
									onBlur={(e) => {
										e.target.style.borderColor = "#d1d5db";
									}}
								/>
								<button
									type="submit"
									disabled={!inputValue.trim() || isLoading}
									style={{
										padding: "8px 12px",
										backgroundColor: primaryColor,
										color: "white",
										border: "none",
										borderRadius: "8px",
										cursor:
											inputValue.trim() && !isLoading
												? "pointer"
												: "not-allowed",
										opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Send size={16} />
								</button>
							</form>
						</>
					)}
				</div>
			)}
		</div>
	);
}
