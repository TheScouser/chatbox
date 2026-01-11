import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Check,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Code,
	Code2,
	Copy,
	Eye,
	Globe,
	Layout,
	Mail,
	Maximize2,
	MessageSquare,
	Building2,
	Package,
	Palette,
	Phone,
	Settings,
	Slack,
	Square,
	Store,
	Webhook,
	Wifi,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ContentCardEmpty } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import {
	Zap,
	Facebook,
	Instagram,
	LifeBuoy,
	Cloud,
	ArrowRight,
	ExternalLink,
	Monitor,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/agents/$agentId/deploy")({
	component: AgentDeploy,
});

// Reusable Deployment Method Card Component
interface DeploymentMethodCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	code: string;
	copyType: string;
	copiedCode: string | null;
	onCopy: (text: string, type: string) => void;
	badge?: React.ReactNode;
	instructions?: React.ReactNode;
	comingSoon?: boolean;
}

function DeploymentMethodCard({
	icon,
	title,
	description,
	code,
	copyType,
	copiedCode,
	onCopy,
	badge,
	instructions,
	comingSoon = false,
}: DeploymentMethodCardProps) {
	const [showInstructions, setShowInstructions] = useState(false);

	return (
		<Card className="bg-card/30 backdrop-blur-sm border-border/40 overflow-hidden group animate-fade-in-up">
			<div className="p-5 border-b border-border/40 flex items-center justify-between group-hover:bg-muted/10 transition-colors">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						{icon}
					</div>
					<div>
						<h4 className="text-sm font-bold">{title}</h4>
						<p className="text-[10px] text-muted-foreground font-semibold">
							{description}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{badge}
					{comingSoon && (
						<Badge variant="outline" className="text-[8px] h-4">
							Coming Soon
						</Badge>
					)}
				</div>
			</div>
			<div className="p-5">
				{instructions && (
					<div className="mb-4">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-muted-foreground hover:text-foreground"
							onClick={() => setShowInstructions(!showInstructions)}
						>
							{showInstructions ? (
								<>
									<ChevronUp className="h-3 w-3 mr-1" />
									Hide Setup Instructions
								</>
							) : (
								<>
									<ChevronDown className="h-3 w-3 mr-1" />
									Show Setup Instructions
								</>
							)}
						</Button>
						{showInstructions && (
							<div className="mt-3 p-4 bg-muted/20 rounded-lg border border-border/30 text-xs space-y-3">
								{instructions}
							</div>
						)}
					</div>
				)}
				<div className="relative group/code">
					<div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-48 custom-scrollbar">
						<pre>
							<code>{code}</code>
						</pre>
					</div>
					<Button
						size="icon"
						variant="glass"
						className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-opacity"
						onClick={() => onCopy(code, copyType)}
					>
						{copiedCode === copyType ? (
							<Check className="h-3.5 w-3.5" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
					</Button>
				</div>
				<div className="mt-4 flex items-center justify-between">
					<p className="text-[10px] text-muted-foreground font-medium pr-8">
						{comingSoon
							? "This integration is coming soon. Check back later for updates."
							: "Copy and paste this code snippet into your application."}
					</p>
					<Button
						size="sm"
						className="h-8 shadow-none"
						onClick={() => onCopy(code, copyType)}
						disabled={comingSoon}
					>
						{copiedCode === copyType ? "Copied!" : "Copy Snippet"}
					</Button>
				</div>
			</div>
		</Card>
	);
}

function AgentDeploy() {
	const { t } = useTranslation();
	const { agentId } = Route.useParams();
	const [copiedCode, setCopiedCode] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("web");
	const [showWidgetSettings, setShowWidgetSettings] = useState(false);
	const [isWidgetEnabled, setIsWidgetEnabled] = useState(true);

	// Customization state
	const [primaryColor, setPrimaryColor] = useState("#3B82F6");
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");

	// API & Webhook state
	const apiKey = null;
	const webhookSecret = null;

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
	const embedUrl = `${baseUrl}/embed/${agent?._id}`;
	const iframeCode = `<iframe 
  src="${embedUrl}?primaryColor=${encodeURIComponent(primaryColor)}" 
  width="${embedWidth}" 
  height="${embedHeight}" 
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);">
</iframe>`;

	const widgetScript = `<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    window.ChatboxWidget=(...args)=>(window.ChatboxWidget.q=window.ChatboxWidget.q||[]).push(args);
    window.ChatboxWidget=new Proxy(window.ChatboxWidget,{get:(t,p)=>p==="q"?t.q:(...a)=>t(p,...a)});
  }
  const onLoad=()=>{
    const s=document.createElement("script");s.type="module";s.id="${agent?._id}";
    s.src="${baseUrl}/widget.min.js";document.body.appendChild(s);
  };
  document.readyState==="complete"?onLoad():window.addEventListener("load",onLoad);
})();
</script>`;

	// Generate API endpoint and examples
	const apiEndpoint = `${baseUrl}/api/agents/${agent?._id}/chat`;
	const apiKeyValue = apiKey || agent?.widgetSecretKey || "YOUR_API_KEY";
	const restApiExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeyValue}" \\
  -d '{
    "message": "Hello, how can you help me?",
    "conversationId": "optional-conversation-id"
  }'`;

	// Generate webhook URL
	const webhookUrl = `${baseUrl}/api/webhooks/${agent?._id}`;
	const webhookSecretValue = webhookSecret || "YOUR_WEBHOOK_SECRET";

	// Generate platform-specific code snippets
	const wordPressShortcode = `[chatbox agent_id="${agent?._id}" primary_color="${primaryColor}"]`;

	const shopifyLiquid = `{% render 'chatbox-widget', agent_id: '${agent?._id}', primary_color: '${primaryColor}' %}`;

	const wixCode = `<script src="${baseUrl}/widget.min.js" data-agent-id="${agent?._id}" data-primary-color="${primaryColor}"></script>`;

	const squarespaceCode = `<!-- Squarespace Code Injection -->
<script>
(function(){
  const s=document.createElement("script");
  s.type="module";
  s.src="${baseUrl}/widget.min.js";
  s.setAttribute("data-agent-id", "${agent?._id}");
  s.setAttribute("data-primary-color", "${primaryColor}");
  document.body.appendChild(s);
})();
</script>`;

	const webflowCode = `<script>
(function(){
  const s=document.createElement("script");
  s.type="module";
  s.src="${baseUrl}/widget.min.js";
  s.setAttribute("data-agent-id", "${agent?._id}");
  s.setAttribute("data-primary-color", "${primaryColor}");
  document.body.appendChild(s);
})();
</script>`;

	// Messaging platform webhook URLs
	const slackWebhookUrl = `${baseUrl}/api/integrations/slack/${agent?._id}`;
	const teamsWebhookUrl = `${baseUrl}/api/integrations/teams/${agent?._id}`;
	const whatsappWebhookUrl = `${baseUrl}/api/integrations/whatsapp/${agent?._id}`;
	const smsWebhookUrl = `${baseUrl}/api/integrations/sms/${agent?._id}`;

	// Messaging Platforms Section
	const MessagingPlatformsSection = () => (
		<div className="space-y-6">
			<h2 className="text-lg font-bold flex items-center gap-3 px-1">
				<MessageSquare className="h-5 w-5 text-primary" />
				Messaging Platforms
			</h2>

			<DeploymentMethodCard
				icon={<Slack className="h-4 w-4 text-primary" />}
				title="Slack Bot"
				description="Integrate with Slack workspace"
				code={slackWebhookUrl}
				copyType="slack"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				comingSoon={true}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Go to{" "}
								<a
									href="https://api.slack.com/apps"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									api.slack.com/apps
								</a>{" "}
								and create a new app
							</li>
							<li>
								Enable "Bot Token Scopes" with{" "}
								<code className="bg-muted px-1 rounded">chat:write</code> and{" "}
								<code className="bg-muted px-1 rounded">app_mentions:read</code>
							</li>
							<li>Install the app to your workspace</li>
							<li>Copy the Bot User OAuth Token</li>
							<li>
								Configure the webhook URL above in your Slack app settings
							</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Building2 className="h-4 w-4 text-primary" />}
				title="Microsoft Teams"
				description="Deploy as Teams bot"
				code={teamsWebhookUrl}
				copyType="teams"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				comingSoon={true}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Go to{" "}
								<a
									href="https://dev.teams.microsoft.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									dev.teams.microsoft.com
								</a>
							</li>
							<li>Create a new bot registration</li>
							<li>Configure messaging endpoint with the webhook URL above</li>
							<li>Add bot to your Teams app manifest</li>
							<li>Deploy and test in Teams</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<MessageSquare className="h-4 w-4 text-primary" />}
				title="WhatsApp Business API"
				description="Connect via Meta Business API"
				code={whatsappWebhookUrl}
				copyType="whatsapp"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				comingSoon={true}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>Set up a Meta Business account and WhatsApp Business API</li>
							<li>Get your API credentials from Meta Business Manager</li>
							<li>Configure webhook URL in Meta Business settings</li>
							<li>Verify webhook with Meta's verification token</li>
							<li>
								Test by sending a message to your WhatsApp Business number
							</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Phone className="h-4 w-4 text-primary" />}
				title="SMS Integration"
				description="Enable SMS conversations via Twilio"
				code={smsWebhookUrl}
				copyType="sms"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				comingSoon={true}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Sign up for a{" "}
								<a
									href="https://www.twilio.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									Twilio
								</a>{" "}
								account
							</li>
							<li>Get a phone number with SMS capabilities</li>
							<li>
								Configure webhook URL in Twilio console for incoming messages
							</li>
							<li>Set up outgoing message API integration</li>
							<li>Test by sending SMS to your Twilio number</li>
						</ol>
			/>
		</div>
	);

	// API & Webhooks Section
	const APISection = () => (
		<div className="space-y-6">
			<h2 className="text-lg font-bold flex items-center gap-3 px-1">
				<Code className="h-5 w-5 text-primary" />
				API & Webhooks
			</h2>

			<DeploymentMethodCard
				icon={<Code className="h-4 w-4 text-primary" />}
				title="REST API"
				description="Send messages via HTTP API"
				code={restApiExample}
				copyType="api"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				badge={
					<Badge variant="outline" className="text-[8px] h-4">
						Production Ready
					</Badge>
				}
				instructions=<div className="space-y-3">
							<div>
								<p className="font-semibold mb-1">Endpoint:</p>
								<code className="bg-muted px-2 py-1 rounded text-xs">
									{apiEndpoint}
								</code>
							</div>
							<div>
								<p className="font-semibold mb-1">Authentication:</p>
								<p className="text-muted-foreground">
									Include your API key in the Authorization header as a Bearer
									token.
								</p>
							</div>
							<div>
								<p className="font-semibold mb-1">Request Body:</p>
								<pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
									<code>{`{
  "message": "Your message here",
  "conversationId": "optional-conversation-id"
}`}</code>
								</pre>
							</div>
							<div>
								<p className="font-semibold mb-1">Response:</p>
								<pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
									<code>{`{
  "messageId": "msg_123",
  "content": "AI response text",
  "conversationId": "conv_456"
}`}</code>
								</pre>
							</div>
						</div>
			/>

			<DeploymentMethodCard
				icon={<Webhook className="h-4 w-4 text-primary" />}
				title="Webhooks"
				description="Receive real-time event notifications"
				code={webhookUrl}
				copyType="webhook"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				comingSoon={true}
				instructions=<div className="space-y-3">
							<div>
								<p className="font-semibold mb-1">Webhook URL:</p>
								<code className="bg-muted px-2 py-1 rounded text-xs break-all">
									{webhookUrl}
								</code>
							</div>
							<div>
								<p className="font-semibold mb-1">Webhook Secret:</p>
								<code className="bg-muted px-2 py-1 rounded text-xs">
									{webhookSecretValue}
								</code>
							</div>
							<div>
								<p className="font-semibold mb-1">Event Types:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>
										<code className="bg-muted px-1 rounded">
											conversation.started
										</code>{" "}
										- New conversation created
									</li>
									<li>
										<code className="bg-muted px-1 rounded">
											message.received
										</code>{" "}
										- User message received
									</li>
									<li>
										<code className="bg-muted px-1 rounded">message.sent</code>{" "}
										- AI response sent
									</li>
									<li>
										<code className="bg-muted px-1 rounded">
											conversation.ended
										</code>{" "}
										- Conversation closed
									</li>
								</ul>
							</div>
							<div>
								<p className="font-semibold mb-1">Verification:</p>
								<p className="text-muted-foreground">
									Webhooks are signed with HMAC-SHA256. Verify the signature
									using your webhook secret.
								</p>
							</div>
						</div>
			/>
		</div>
	);

	// Platform Integrations Section
	const PlatformIntegrationsSection = () => (
		<div className="space-y-6">
			<h2 className="text-lg font-bold flex items-center gap-3 px-1">
				<Package className="h-5 w-5 text-primary" />
				Platform Integrations
			</h2>

			<DeploymentMethodCard
				icon={<Store className="h-4 w-4 text-primary" />}
				title="WordPress"
				description="Install as WordPress plugin or shortcode"
				code={wordPressShortcode}
				copyType="wordpress"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Install the Chatbox plugin from WordPress plugin directory (or
								upload manually)
							</li>
							<li>Activate the plugin in your WordPress admin</li>
							<li>
								Go to Settings → Chatbox and enter your Agent ID:{" "}
								<code className="bg-muted px-1 rounded">{agent?._id}</code>
							</li>
							<li>
								Use the shortcode in any post or page:{" "}
								<code className="bg-muted px-1 rounded">
									{wordPressShortcode}
								</code>
							</li>
							<li>Or use the widget in Appearance → Widgets</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Store className="h-4 w-4 text-primary" />}
				title="Shopify"
				description="Add to Shopify store"
				code={shopifyLiquid}
				copyType="shopify"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>Go to your Shopify admin → Online Store → Themes</li>
							<li>Click "Actions" → "Edit code" on your active theme</li>
							<li>
								Open <code className="bg-muted px-1 rounded">theme.liquid</code>{" "}
								in the Layout section
							</li>
							<li>
								Add the code snippet before the closing{" "}
								<code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag
							</li>
							<li>Or create a custom section in your theme for more control</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Square className="h-4 w-4 text-primary" />}
				title="Wix"
				description="Embed in Wix website"
				code={wixCode}
				copyType="wix"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>
								Go to your Wix editor and select the page where you want to add
								the widget
							</li>
							<li>Click "Add" → "Embed" → "Embed a Site"</li>
							<li>Or go to Settings → Custom Code → Head Code</li>
							<li>Paste the code snippet in the custom code section</li>
							<li>Save and publish your site</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Square className="h-4 w-4 text-primary" />}
				title="Squarespace"
				description="Add via code injection"
				code={squarespaceCode}
				copyType="squarespace"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>Go to Settings → Advanced → Code Injection</li>
							<li>Paste the code snippet in the "Footer" section</li>
							<li>Click "Save" to apply changes</li>
							<li>The widget will appear on all pages of your site</li>
						</ol>
			/>

			<DeploymentMethodCard
				icon={<Wifi className="h-4 w-4 text-primary" />}
				title="Webflow"
				description="Custom code embed"
				code={webflowCode}
				copyType="webflow"
				copiedCode={copiedCode}
				onCopy={copyToClipboard}
				instructions=<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
							<li>Open your Webflow project</li>
							<li>Go to Project Settings → Custom Code</li>
							<li>Paste the code snippet in the "Footer Code" section</li>
							<li>Or add it to a specific page using the Embed element</li>
							<li>Publish your site to see the changes</li>
						</ol>
			/>
		</div>
	);

	if (agents === undefined) {
		return (
			<div className="animate-pulse space-y-8">
				<div className="h-12 bg-muted/20 rounded-xl w-1/3" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="h-[500px] bg-muted/10 rounded-2xl" />
					<div className="h-[500px] bg-muted/10 rounded-2xl" />
				</div>
			</div>
		);
	}

	if (!agent) {
		return (
			<PageLayout>
				<ContentCardEmpty
					icon={Globe}
					title="Agent not found"
					description="The agent you're looking for doesn't exist."
				/>
			</PageLayout>
		);
	}

	if (showWidgetSettings) {
		return (
			<PageLayout>
				<PageHeader
					title="Widget Customization"
					description="Customize how your chat widget looks and behaves on your website."
				>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowWidgetSettings(false)}
					>
						<ChevronRight className="h-3.5 w-3.5 mr-2 rotate-180" />
						Back to Integrations
					</Button>
				</PageHeader>

				<div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
					{/* Left Column: Config & Code */}
					<div className="w-full lg:col-span-7 space-y-8">
						{/* Configuration Panel */}
						<Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden animate-fade-in-up">
							<div className="p-6 border-b border-border/40 bg-muted/20 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
										<Settings className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h3 className="text-base font-bold">Widget Settings</h3>
										<p className="text-xs text-muted-foreground font-medium">
											Customize the appearance and behavior
										</p>
									</div>
								</div>
								<Badge variant="outline" className="bg-background/50">
									Production Ready
								</Badge>
							</div>
							<CardContent className="p-6 space-y-6">
								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
											<Maximize2 className="h-3 w-3" />
											Width
										</label>
										<div className="relative">
											<Input
												value={embedWidth}
												onChange={(e) => setEmbedWidth(e.target.value)}
												className="pr-10"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">
												PX
											</span>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
											<Maximize2 className="h-3 w-3 rotate-90" />
											Height
										</label>
										<div className="relative">
											<Input
												value={embedHeight}
												onChange={(e) => setEmbedHeight(e.target.value)}
												className="pr-10"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">
												PX
											</span>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
										<Palette className="h-3 w-3" />
										Brand Color
									</label>
									<div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
										<div
											className="w-12 h-12 rounded-lg shadow-lg border border-white/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden"
											style={{ backgroundColor: primaryColor }}
										>
											<input
												type="color"
												value={primaryColor}
												onChange={(e) => setPrimaryColor(e.target.value)}
												className="absolute inset-0 opacity-0 cursor-pointer"
											/>
										</div>
										<div className="flex-1 space-y-1">
											<Input
												value={primaryColor}
												onChange={(e) => setPrimaryColor(e.target.value)}
												className="h-9 font-mono text-sm"
											/>
											<p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
												<ChevronRight className="h-2 w-2" />
												This color will be used for buttons, icons, and
												highlights
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-6">
							<h2 className="text-lg font-bold flex items-center gap-3 px-1">
								<Code2 className="h-5 w-5 text-primary" />
								Installation Code
							</h2>

							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-full"
							>
								<TabsList className="grid w-full grid-cols-4">
									<TabsTrigger value="web" className="text-xs">
										<Globe className="h-3.5 w-3.5 mr-1.5" />
										Web
									</TabsTrigger>
									<TabsTrigger value="messaging" className="text-xs">
										<MessageSquare className="h-3.5 w-3.5 mr-1" />
										Messaging
									</TabsTrigger>
									<TabsTrigger value="api" className="text-xs">
										<Code className="h-3.5 w-3.5 mr-1.5" />
										API
									</TabsTrigger>
									<TabsTrigger value="platforms" className="text-xs">
										<Package className="h-3.5 w-3.5 mr-1.5" />
										Platforms
									</TabsTrigger>
								</TabsList>

								<TabsContent value="web" className="space-y-6 mt-6">
									<DeploymentMethodCard
										icon={<Layout className="h-4 w-4 text-primary" />}
										title="Chat Bubble Widget"
										description="Recommended for most websites"
										code={widgetScript}
										copyType="bubble"
										copiedCode={copiedCode}
										onCopy={copyToClipboard}
										badge={
											<Badge variant="default" className="text-[8px] h-4">
												Most Popular
											</Badge>
										}
										instructions={
											<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
												<li>Copy the code snippet above</li>
												<li>Open your website's HTML editor or theme files</li>
												<li>
													Paste the code right before the closing{" "}
													<code className="bg-muted px-1 rounded">
														&lt;/body&gt;
													</code>{" "}
													tag
												</li>
												<li>Save and publish your changes</li>
											</ol>
										}
									/>

									<DeploymentMethodCard
										icon={<Maximize2 className="h-4 w-4 text-primary" />}
										title="Direct Iframe"
										description="Best for specific layout blocks"
										code={iframeCode}
										copyType="iframe"
										copiedCode={copiedCode}
										onCopy={copyToClipboard}
										instructions={
											<ol className="list-decimal list-inside space-y-2 text-muted-foreground">
												<li>Copy the iframe code snippet above</li>
												<li>
													Paste it into your HTML where you want the chat widget
													to appear
												</li>
												<li>
													Adjust width and height attributes to fit your layout
												</li>
											</ol>
										}
									/>
								</TabsContent>

								<TabsContent value="messaging" className="mt-6">
									<MessagingPlatformsSection />
								</TabsContent>

								<TabsContent value="api" className="mt-6">
									<APISection />
								</TabsContent>

								<TabsContent value="platforms" className="mt-6">
									<PlatformIntegrationsSection />
								</TabsContent>
							</Tabs>
						</div>
					</div>

					{/* Right Column: Preview */}
					<div className="w-full lg:col-span-5 sticky top-24 animate-fade-in-left">
						<div className="relative">
							<div className="bg-zinc-950 rounded-[2.5rem] p-4 border-[8px] border-zinc-900 shadow-2xl overflow-hidden aspect-[9/16] max-h-[700px] mx-auto w-full max-w-[360px]">
								<div className="w-1/3 h-6 bg-zinc-900 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-10" />
								<div className="h-full w-full bg-background rounded-[1.5rem] overflow-hidden relative">
									<div className="p-6 space-y-4 opacity-20 pointer-events-none">
										<div className="h-6 w-1/3 bg-muted rounded-md" />
										<div className="space-y-2">
											<div className="h-4 bg-muted rounded-md" />
											<div className="h-4 w-5/6 bg-muted rounded-md" />
										</div>
										<div className="h-32 bg-muted rounded-xl" />
									</div>

									<div className="absolute inset-x-0 bottom-0 h-full">
										<iframe
											src={`${embedUrl}?primaryColor=${encodeURIComponent(primaryColor)}`}
											className="w-full h-full border-0 animate-fade-in"
											title="Preview"
										/>
									</div>
								</div>
							</div>
							<div className="absolute -bottom-6 inset-x-0 text-center">
								<Badge
									variant="outline"
									className="bg-card w-auto py-1.5 px-4 shadow-lg border-border/60"
								>
									<Eye className="h-3 w-3 mr-2 text-primary" />
									Real-time Preview
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</PageLayout>
		);
	}

	const integrations = [
		{
			id: "email",
			name: "Email",
			description:
				"Connect your agent to an email address and let it respond to messages from your customers.",
			icon: <Mail className="h-5 w-5 text-rose-500" />,
			badge: "Beta",
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "zapier",
			name: "Zapier",
			description: "Connect your agent with thousands of apps using Zapier.",
			icon: <Zap className="h-5 w-5 text-orange-500" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "slack",
			name: "Slack",
			description:
				"Connect your agent to Slack, mention it, and have it reply to any message.",
			icon: <Slack className="h-5 w-5 text-purple-500" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "wordpress",
			name: "WordPress",
			description:
				"Use the official Chatbox plugin for WordPress to add the chat widget to your website.",
			icon: <Globe className="h-5 w-5 text-blue-600" />,
			buttonText: "Setup",
			status: "available",
		},
		{
			id: "whatsapp",
			name: "WhatsApp",
			description:
				"Connect your agent to a WhatsApp number and let it respond to messages from your customers.",
			icon: <MessageSquare className="h-5 w-5 text-green-500" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "messenger",
			name: "Messenger",
			description:
				"Connect your agent to a Facebook page and let it respond to messages from your customers.",
			icon: <Facebook className="h-5 w-5 text-blue-500" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "instagram",
			name: "Instagram",
			description:
				"Connect your agent to an Instagram page and let it respond to messages from your customers.",
			icon: <Instagram className="h-5 w-5 text-pink-500" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "zendesk",
			name: "Zendesk",
			description:
				"Create Zendesk tickets from your customers and let your agent reply to them.",
			icon: <LifeBuoy className="h-5 w-5 text-emerald-600" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "salesforce",
			name: "Salesforce",
			description:
				"Create Salesforce cases from your customers and let your agent reply to them.",
			icon: <Cloud className="h-5 w-5 text-sky-400" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
		{
			id: "api",
			name: "API",
			description:
				"Integrate your agent directly with your applications using our REST API.",
			icon: <Code2 className="h-5 w-5 text-zinc-400" />,
			buttonText: "Subscribe to enable",
			status: "locked",
		},
	];

	return (
		<PageLayout>
			<PageHeader
				title={t("deploy.title")}
				description={t("deploy.description")}
			/>

			<div className="space-y-8 animate-fade-in">
				{/* Top Row: Primary Methods */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Chat Widget Card */}
					<Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-md">
						<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors" />
						<div className="p-8 space-y-6">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
										<MessageSquare className="h-6 w-6 text-primary" />
									</div>
									<h3 className="text-xl font-bold">
										{t("deploy.chatWidget")}
									</h3>
									<p className="text-sm text-muted-foreground max-w-xs">
										{t("deploy.chatWidgetDesc")}
									</p>
								</div>
								<Switch
									checked={isWidgetEnabled}
									onCheckedChange={setIsWidgetEnabled}
								/>
							</div>

							<div className="flex items-center gap-3 pt-4">
								<Button
									variant="outline"
									size="icon"
									className="rounded-xl border-border/60 hover:bg-muted"
									onClick={() =>
										window.open(`${baseUrl}/widget-demo/${agent._id}`, "_blank")
									}
								>
									<Monitor className="h-4 w-4" />
								</Button>
								<Button
									className="flex-1 rounded-xl shadow-lg shadow-primary/20"
									onClick={() => setShowWidgetSettings(true)}
								>
									{t("deploy.manage")}
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</div>
					</Card>

					{/* Help Page Card */}
					<Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-md">
						<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
						<div className="p-8 space-y-6">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
										<Globe className="h-6 w-6 text-emerald-500" />
									</div>
									<h3 className="text-xl font-bold">{t("deploy.helpPage")}</h3>
									<p className="text-sm text-muted-foreground max-w-xs">
										{t("deploy.helpPageDesc")}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 pt-4">
								<Button
									variant="outline"
									size="icon"
									className="rounded-xl border-border/60 hover:bg-muted"
									onClick={() => window.open(embedUrl, "_blank")}
								>
									<ExternalLink className="h-4 w-4" />
								</Button>
								<Button
									variant="secondary"
									className="flex-1 rounded-xl hover:bg-muted"
									onClick={() => copyToClipboard(embedUrl, "public-link")}
								>
									{copiedCode === "public-link"
										? t("deploy.copied")
										: t("deploy.setup")}
								</Button>
							</div>
						</div>
					</Card>
				</div>

				{/* Integrations Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{integrations.map((item) => (
						<Card
							key={item.id}
							className="relative overflow-hidden group border-border/40 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all hover:shadow-xl hover:-translate-y-1"
						>
							<div className="p-6 space-y-4 flex flex-col h-full">
								<div className="flex items-center justify-between">
									<div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center group-hover:scale-110 transition-all">
										{item.icon}
									</div>
									{item.badge && (
										<Badge
											variant="outline"
											className="text-[9px] font-bold py-0 h-5 bg-background/50"
										>
											{item.badge}
										</Badge>
									)}
								</div>

								<div className="space-y-1 flex-1">
									<h4 className="font-bold text-sm">{item.name}</h4>
									<p className="text-xs text-muted-foreground leading-relaxed">
										{item.description}
									</p>
								</div>

								<div className="flex items-center gap-2 pt-2">
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8 rounded-lg shrink-0 border-border/60"
									>
										<Monitor className="h-3.5 w-3.5" />
									</Button>
									<Button
										variant={
											item.status === "available" ? "default" : "secondary"
										}
										size="sm"
										className="flex-1 h-8 text-[11px] font-bold rounded-lg"
										disabled={item.id === "api" && item.status === "locked"}
									>
										{item.buttonText}
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</PageLayout>
	);
}
