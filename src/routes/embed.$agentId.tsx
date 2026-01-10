import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";
import { detectUserLocale } from "../lib/locale";

export const Route = createFileRoute("/embed/$agentId")({
	component: EmbedChat,
});

function EmbedChat() {
	const { agentId } = Route.useParams();
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);

	// Extract widgetId from URL parameters
	const [widgetId, setWidgetId] = useState<Id<"widgetConfigurations"> | undefined>(undefined);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const widgetIdParam = urlParams.get("widgetId");
		if (widgetIdParam) {
			setWidgetId(widgetIdParam as Id<"widgetConfigurations">);
		}
	}, []);

	// Get agent details
	const agent = useQuery(api.agents.getAgentById, {
		agentId: agentId as Id<"agents">,
	});

	// Detect initial locale
	const initialLocale = detectUserLocale();

	// Fetch widget config (uses default if no widgetId)
	const widgetData = useQuery(
		api.widgetConfig.getWidgetConfigForEmbed,
		agent
			? {
				agentId: agentId as Id<"agents">,
				widgetId: widgetId,
				locale: initialLocale,
			}
			: "skip"
	);

	// Determine locale to use: widget language setting or detected locale
	const effectiveLocale = widgetData?.interface?.language && widgetData.interface.language !== "auto"
		? widgetData.interface.language
		: initialLocale;

	// Apply widget configuration styles
	useEffect(() => {
		if (widgetData) {
			const { branding } = widgetData;
			if (branding.primaryColor) {
				document.documentElement.style.setProperty(
					"--primary-color",
					branding.primaryColor,
				);
				// Set additional color variations
				const rgb = hexToRgb(branding.primaryColor);
				if (rgb) {
					document.documentElement.style.setProperty(
						"--primary-color-rgb",
						`${rgb.r}, ${rgb.g}, ${rgb.b}`,
					);
				}
			}
			if (branding.foregroundColor) {
				document.documentElement.style.setProperty(
					"--foreground-color",
					branding.foregroundColor,
				);
			}
		}
	}, [widgetData]);

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

	if (widgetData === undefined) {
		return (
			<div className="h-screen flex items-center justify-center bg-white">
				<div className="text-center p-4">
					<Loader2 className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-spin" />
					<p className="text-sm text-gray-600">Loading widget...</p>
				</div>
			</div>
		);
	}

	if (!widgetData) {
		return (
			<div className="h-screen flex items-center justify-center bg-white">
				<div className="text-center p-4">
					<Bot className="mx-auto h-8 w-8 text-gray-400 mb-2" />
					<p className="text-sm text-gray-600">Widget configuration not found</p>
				</div>
			</div>
		);
	}

	const { branding, config } = widgetData;

	return (
		<div className="h-screen bg-white">
			<style>{`
				:root {
					--primary-color: ${branding.primaryColor};
					--foreground-color: ${branding.foregroundColor};
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
				locale={effectiveLocale}
			/>
		</div>
	);
}
