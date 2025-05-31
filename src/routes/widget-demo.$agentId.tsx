import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ChatBubbleWidget from "../components/ChatBubbleWidget";

export const Route = createFileRoute("/widget-demo/$agentId")({
	component: WidgetDemo,
});

function WidgetDemo() {
	const { agentId } = Route.useParams();

	return (
		<Authenticated>
			<WidgetDemoContent agentId={agentId} />
		</Authenticated>
	);
}

function WidgetDemoContent({ agentId }: { agentId: string }) {
	// Get agent info for demo
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	if (agents === undefined) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading agent...</p>
				</div>
			</div>
		);
	}

	if (!agent) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Agent Not Found
					</h1>
					<p className="text-gray-600 mb-6">
						The agent you're looking for doesn't exist or you don't have access
						to it.
					</p>
					<button
						onClick={() => window.history.back()}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						← Go Back
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Demo Website Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<header className="text-center mb-12">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							Widget Demo - {agent?.name || "Chat Assistant"}
						</h1>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							This is a demo page showing how the chat bubble widget appears on
							your website. The floating chat bubble in the bottom-right corner
							is your agent!
						</p>
					</header>

					{/* Demo Content */}
					<div className="grid md:grid-cols-2 gap-8 mb-12">
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								🚀 Easy Integration
							</h2>
							<p className="text-gray-600 mb-4">
								Add the chat widget to any website with just one line of code.
								No complex setup or configuration required.
							</p>
							<div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
								&lt;script src="your-widget-url"&gt;&lt;/script&gt;
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								💬 Smart Conversations
							</h2>
							<p className="text-gray-600 mb-4">
								Your AI agent can answer questions, provide support, and engage
								with visitors using your custom knowledge base.
							</p>
							<ul className="text-gray-600 space-y-2">
								<li>• Instant responses</li>
								<li>• Knowledge-based answers</li>
								<li>• 24/7 availability</li>
							</ul>
						</div>
					</div>

					{/* Features */}
					<div className="bg-white rounded-lg shadow-lg p-8 mb-12">
						<h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
							Widget Features
						</h2>
						<div className="grid md:grid-cols-3 gap-6">
							<div className="text-center">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl">🎨</span>
								</div>
								<h3 className="font-semibold text-gray-900 mb-2">
									Customizable
								</h3>
								<p className="text-gray-600 text-sm">
									Match your brand colors and positioning preferences
								</p>
							</div>
							<div className="text-center">
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl">📱</span>
								</div>
								<h3 className="font-semibold text-gray-900 mb-2">Responsive</h3>
								<p className="text-gray-600 text-sm">
									Works perfectly on desktop, tablet, and mobile devices
								</p>
							</div>
							<div className="text-center">
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<span className="text-2xl">⚡</span>
								</div>
								<h3 className="font-semibold text-gray-900 mb-2">Fast</h3>
								<p className="text-gray-600 text-sm">
									Lightweight and optimized for quick loading
								</p>
							</div>
						</div>
					</div>

					{/* Call to Action */}
					<div className="text-center bg-white rounded-lg shadow-lg p-8">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Try the Chat Widget
						</h2>
						<p className="text-gray-600 mb-6">
							Click the chat bubble in the bottom-right corner to start a
							conversation with the AI agent. This is exactly how your website
							visitors will interact with it.
						</p>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<p className="text-sm text-blue-800">
								<strong>💡 Tip:</strong> The chat widget is fully functional! It
								will use your agent's knowledge base to answer questions. Try
								asking about topics related to your uploaded documents or
								knowledge entries.
							</p>
						</div>
						<div className="flex justify-center gap-4">
							<button
								onClick={() => window.history.back()}
								className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
							>
								← Back to Dashboard
							</button>
							<button
								onClick={() => {
									// Trigger widget open if available
									if (window.ChatboxWidget) {
										window.ChatboxWidget("open");
									}
								}}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Open Chat Widget
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Chat Bubble Widget */}
			<ChatBubbleWidget
				agentId={agentId}
				primaryColor="#2563eb"
				position="bottom-right"
			/>
		</div>
	);
}
