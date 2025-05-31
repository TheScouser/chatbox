import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";

export const Route = createFileRoute("/embed/$agentId")({
	component: EmbedChat,
});

function EmbedChat() {
	const { agentId } = Route.useParams();
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);
	const [primaryColor, setPrimaryColor] = useState("#2563eb");

	// Get agent details
	const agent = useQuery(api.agents.getAgentById, {
		agentId: agentId as Id<"agents">,
	});

	// Extract primaryColor from URL parameters
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const colorParam = urlParams.get("primaryColor");
		if (colorParam) {
			setPrimaryColor(colorParam);
		}
	}, []);

	// Apply custom CSS variables for theming
	useEffect(() => {
		if (primaryColor) {
			document.documentElement.style.setProperty(
				"--primary-color",
				primaryColor,
			);
			// Set additional color variations
			const rgb = hexToRgb(primaryColor);
			if (rgb) {
				document.documentElement.style.setProperty(
					"--primary-color-rgb",
					`${rgb.r}, ${rgb.g}, ${rgb.b}`,
				);
			}
		}
	}, [primaryColor]);

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

	// Helper function to convert hex to RGB
	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: Number.parseInt(result[1], 16),
					g: Number.parseInt(result[2], 16),
					b: Number.parseInt(result[3], 16),
				}
			: null;
	};

	if (!agent) {
		return (
			<div className="h-screen flex items-center justify-center bg-white">
				<div className="text-center p-4">
					<Bot className="mx-auto h-8 w-8 text-gray-400 mb-2" />
					<p className="text-sm text-gray-600">Agent not available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-white">
			<style>{`
				:root {
					--primary-color: ${primaryColor};
				}
				.chat-widget-primary {
					background-color: var(--primary-color) !important;
				}
				.chat-widget-primary-text {
					color: var(--primary-color) !important;
				}
			`}</style>
			<ChatWidget
				agentId={agentId as Id<"agents">}
				conversationId={currentConversationId}
				onConversationCreate={handleConversationCreate}
				height="100vh"
				className="border-0 shadow-none rounded-none"
			/>
		</div>
	);
}
