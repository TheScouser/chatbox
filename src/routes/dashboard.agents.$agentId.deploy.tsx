import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Bot,
	Check,
	Copy,
	ExternalLink,
	Globe,
	MessageSquare,
	Settings,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/agents/$agentId/deploy")({
	component: AgentDeploy,
});

function AgentDeploy() {
	const { agentId } = Route.useParams();
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	// Customization options
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");
	const [primaryColor, setPrimaryColor] = useState("#2563eb");

	// Get agent data
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedCode(type);
			setTimeout(() => setCopiedCode(null), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	// Generate embed URLs
	const baseUrl = window.location.origin;
	const publicChatUrl = `${baseUrl}/chat/${agent?._id}`;
	const embedUrl = `${baseUrl}/embed/${agent?._id}`;
	const iframeCode = `<iframe 
	src="${embedUrl}?primaryColor=${encodeURIComponent(primaryColor)}" 
	width="${embedWidth}" 
	height="${embedHeight}" 
	frameborder="0"
	style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
</iframe>`;

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
				<Globe className="mx-auto h-12 w-12 text-gray-400" />
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
		<div className="space-y-8">
			<div>
				<h3 className="text-2xl font-bold text-gray-900">
					Deploy Your Agent
				</h3>
				<p className="mt-1 text-gray-600">
					Share your agent with the world using these deployment
					options.
				</p>
			</div>

			{/* Chat Bubble Widget */}
			<div className="bg-white shadow rounded-lg p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-3">
						<MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
						<div>
							<h4 className="text-sm font-medium text-gray-900">
								Chat Bubble Widget
								<span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									Recommended
								</span>
							</h4>
							<p className="text-sm text-gray-600 mt-1">
								Floating chat bubble that appears on your website.
								Easy one-line installation.
							</p>
						</div>
					</div>
					<a
						href={`${baseUrl}/widget-demo/${agent._id}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Preview →
					</a>
				</div>
				<div className="mt-4">
					<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
						{`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    var l=document.createElement("script");
    l.src="${baseUrl}/widget.js";
    l.onload=function(){
      ChatboxWidget.init({
        agentId: "${agent._id}",
        primaryColor: "${primaryColor}"
      });
    };
    document.head.appendChild(l);
  }
})();
</script>`}
					</div>
					<button
						onClick={() =>
							copyToClipboard(
								`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    var l=document.createElement("script");
    l.src="${baseUrl}/widget.js";
    l.onload=function(){
      ChatboxWidget.init({
        agentId: "${agent._id}",
        primaryColor: "${primaryColor}"
      });
    };
    document.head.appendChild(l);
  }
})();
</script>`,
								"bubble",
							)
						}
						className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
					>
						{copiedCode === "bubble" ? (
							<>
								<Check className="h-4 w-4" />
								Copied!
							</>
						) : (
							<>
								<Copy className="h-4 w-4" />
								Copy Widget Code
							</>
						)}
					</button>
				</div>
			</div>

			{/* Public Chat Link */}
			<div className="bg-white shadow rounded-lg p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-3">
						<ExternalLink className="h-5 w-5 text-green-600 mt-0.5" />
						<div>
							<h4 className="text-sm font-medium text-gray-900">
								Public Chat Link
							</h4>
							<p className="text-sm text-gray-600 mt-1">
								Direct link for users to chat with your agent
							</p>
						</div>
					</div>
					<a
						href={publicChatUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Preview →
					</a>
				</div>
				<div className="mt-4">
					<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
						{publicChatUrl}
					</div>
					<button
						onClick={() => copyToClipboard(publicChatUrl, "public")}
						className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						{copiedCode === "public" ? (
							<>
								<Check className="h-4 w-4 text-green-600" />
								Copied!
							</>
						) : (
							<>
								<Copy className="h-4 w-4" />
								Copy Link
							</>
						)}
					</button>
				</div>
			</div>

			{/* Iframe Embed */}
			<div className="bg-white shadow rounded-lg p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-3">
						<Globe className="h-5 w-5 text-purple-600 mt-0.5" />
						<div>
							<h4 className="text-sm font-medium text-gray-900">
								Website Embed Code
							</h4>
							<p className="text-sm text-gray-600 mt-1">
								Embed the chat widget directly on your website
							</p>
						</div>
					</div>
					<a
						href={embedUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Preview →
					</a>
				</div>
				<div className="mt-4">
					<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
						{iframeCode}
					</div>
					<button
						onClick={() => copyToClipboard(iframeCode, "iframe")}
						className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						{copiedCode === "iframe" ? (
							<>
								<Check className="h-4 w-4 text-green-600" />
								Copied!
							</>
						) : (
							<>
								<Copy className="h-4 w-4" />
								Copy Embed Code
							</>
						)}
					</button>
				</div>
			</div>

			{/* Customization Options */}
			<div className="bg-white shadow rounded-lg p-6">
				<div className="flex items-start gap-3 mb-6">
					<Settings className="h-5 w-5 text-blue-600 mt-0.5" />
					<div>
						<h4 className="text-sm font-medium text-gray-900">
							Customize Widget
						</h4>
						<p className="text-sm text-gray-600 mt-1">
							Adjust the appearance and size of your chat widget
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Width */}
					<div className="space-y-2">
						<Label htmlFor="width" className="text-sm font-medium">
							Width
						</Label>
						<Select
							value={embedWidth}
							onValueChange={setEmbedWidth}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="300">300px</SelectItem>
								<SelectItem value="400">400px</SelectItem>
								<SelectItem value="500">500px</SelectItem>
								<SelectItem value="100%">100%</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Height */}
					<div className="space-y-2">
						<Label htmlFor="height" className="text-sm font-medium">
							Height
						</Label>
						<Select
							value={embedHeight}
							onValueChange={setEmbedHeight}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="400">400px</SelectItem>
								<SelectItem value="500">500px</SelectItem>
								<SelectItem value="600">600px</SelectItem>
								<SelectItem value="700">700px</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Primary Color */}
					<div className="space-y-2">
						<Label htmlFor="color" className="text-sm font-medium">
							Primary Color
						</Label>
						<div className="flex gap-2">
							<Input
								type="color"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								className="w-12 h-10 p-1 border rounded"
							/>
							<Input
								type="text"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								placeholder="#2563eb"
								className="flex-1"
							/>
						</div>
					</div>
				</div>

				{/* Preview */}
				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
					<h5 className="text-sm font-medium text-gray-900 mb-2">
						Preview
					</h5>
					<div className="text-xs text-gray-600 mb-3">
						Widget size: {embedWidth} × {embedHeight}
					</div>
					<div
						className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm"
						style={{
							width:
								embedWidth === "100%" ? "100%" : `${embedWidth}px`,
							height: "120px",
							maxWidth: "100%",
						}}
					>
						<div className="text-center">
							<Bot
								className="h-6 w-6 mx-auto mb-1"
								style={{ color: primaryColor }}
							/>
							<div>Chat Widget Preview</div>
							<div className="text-xs">
								{embedWidth} × {embedHeight}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Usage Tips */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
				<div className="flex items-start gap-3">
					<Settings className="h-5 w-5 text-blue-600 mt-0.5" />
					<div>
						<h4 className="text-sm font-medium text-blue-800">
							Usage Tips
						</h4>
						<div className="mt-3 text-sm text-blue-700 space-y-2">
							<p>
								<strong>Responsive Design:</strong> Use 100% width
								for mobile-friendly widgets
							</p>
							<p>
								<strong>Color Matching:</strong> Choose a primary
								color that matches your brand
							</p>
							<p>
								<strong>Size Guidelines:</strong>
							</p>
							<ul className="mt-1 space-y-1 ml-4">
								<li>• Desktop sidebar: 300-400px wide</li>
								<li>• Full-width mobile: 100% × 500px</li>
								<li>• Popup/modal: 400-500px × 600px</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			{/* Integration Instructions */}
			<div className="bg-white shadow rounded-lg p-6">
				<h4 className="text-sm font-medium text-gray-900 mb-3">
					Integration Instructions
				</h4>
				<div className="space-y-3 text-sm text-gray-600">
					<div>
						<strong>1. Copy the embed code</strong> from above
					</div>
					<div>
						<strong>2. Paste it into your website's HTML</strong>{" "}
						where you want the chat widget to appear
					</div>
					<div>
						<strong>3. Adjust the width and height</strong> as
						needed for your layout
					</div>
					<div>
						<strong>4. Test the integration</strong> to ensure it
						works correctly
					</div>
				</div>
			</div>
		</div>
	);
} 