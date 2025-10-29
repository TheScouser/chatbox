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
import { Button } from "../components/ui/button";
import { PageLayout, TwoColumnLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import { ContentCard, ContentCardEmpty, ContentCardListItem } from "../components/ui/content-card";
import { FormCard, FormSection, FormField } from "../components/ui/form-card";

export const Route = createFileRoute("/dashboard/agents/$agentId/deploy")({
	component: AgentDeploy,
});

function AgentDeploy() {
	const { agentId } = Route.useParams();
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	// Customization state
	const [primaryColor, setPrimaryColor] = useState("#3B82F6");
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");

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
				<div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
				<div className="h-96 bg-muted rounded"></div>
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

	return (
		<PageLayout>
			<PageHeader
				title="Deploy Your Agent"
				description="Share your agent with the world using these deployment options."
			/>

			<TwoColumnLayout>
				{/* Chat Bubble Widget */}
				<ContentCard
					title="Chat Bubble Widget"
					description="Embed a chat bubble on your website. Enables all advanced features of the agent."
					className="border-primary"
				>
					<ContentCardListItem>
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
									Recommended
								</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={() => window.open(`${baseUrl}/widget-demo/${agent._id}`, '_blank')}
							>
								<ExternalLink className="h-3 w-3 mr-1" />
								Preview
							</Button>
						</div>
						<div className="bg-muted rounded p-2 mb-2 h-16 overflow-x-auto overflow-y-hidden">
							<code className="text-xs text-muted-foreground font-mono whitespace-nowrap">
								{`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    window.ChatboxWidget=(...arguments)=>{
      if(!window.ChatboxWidget.q){window.ChatboxWidget.q=[]}
      window.ChatboxWidget.q.push(arguments)
    };
    window.ChatboxWidget=new Proxy(window.ChatboxWidget,{
      get(target,prop){
        if(prop==="q"){return target.q}
        return(...args)=>target(prop,...args)
      }
    })
  }
  const onLoad=function(){
    const script=document.createElement("script");
    script.type="module";
    script.src="/widget.min.js";
    script.id="${agent._id}";
    script.domain=location.hostname;
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`}
							</code>
						</div>
						<Button
							size="sm"
							onClick={() =>
								copyToClipboard(
									`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    window.ChatboxWidget=(...arguments)=>{
      if(!window.ChatboxWidget.q){window.ChatboxWidget.q=[]}
      window.ChatboxWidget.q.push(arguments)
    };
    window.ChatboxWidget=new Proxy(window.ChatboxWidget,{
      get(target,prop){
        if(prop==="q"){return target.q}
        return(...args)=>target(prop,...args)
      }
    })
  }
  const onLoad=function(){
    const script=document.createElement("script");
    script.type="module";
    script.src="/widget.min.js";
    script.id="${agent._id}";
    script.domain=location.hostname;
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`,
									"bubble",
								)
							}
						>
							{copiedCode === "bubble" ? (
								<>
									<Check className="h-3 w-3 mr-1" />
									Copied!
								</>
							) : (
								<>
									<Copy className="h-3 w-3 mr-1" />
									Copy Code
								</>
							)}
						</Button>
					</ContentCardListItem>
				</ContentCard>

				{/* Iframe Embed */}
				<ContentCard
					title="Iframe Embed"
					description="Add the agent anywhere on your website"
				>
					<ContentCardListItem>
						<div className="flex items-center justify-end mb-3">
							<Button
								size="sm"
								variant="outline"
								onClick={() => window.open(embedUrl, '_blank')}
							>
								<ExternalLink className="h-3 w-3 mr-1" />
								Preview
							</Button>
						</div>
						<div className="bg-muted rounded p-2 mb-2 h-16 overflow-x-auto overflow-y-hidden">
							<code className="text-xs text-muted-foreground font-mono whitespace-nowrap">
								{iframeCode}
							</code>
						</div>
						<Button
							size="sm"
							onClick={() => copyToClipboard(iframeCode, "iframe")}
						>
							{copiedCode === "iframe" ? (
								<>
									<Check className="h-3 w-3 mr-1" />
									Copied!
								</>
							) : (
								<>
									<Copy className="h-3 w-3 mr-1" />
									Copy Code
								</>
							)}
						</Button>
					</ContentCardListItem>
				</ContentCard>
			</TwoColumnLayout>

			{/* Configuration */}
			<FormCard
				title="Configuration"
				description={`Configure your widget for ${new URL(baseUrl).hostname}`}
				icon={Settings}
			>
				<FormSection>
					<div className="flex items-center gap-4">
						<FormField label="Width" className="flex-1">
							<Input
								value={embedWidth}
								onChange={(e) => setEmbedWidth(e.target.value)}
								className="h-8"
							/>
						</FormField>
						<FormField label="Height" className="flex-1">
							<Input
								value={embedHeight}
								onChange={(e) => setEmbedHeight(e.target.value)}
								className="h-8"
							/>
						</FormField>
					</div>

					<FormField label="Primary Color">
						<div className="flex items-center gap-2">
							<Input
								type="color"
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								className="h-8 w-16"
							/>
							<Input
								value={primaryColor}
								onChange={(e) => setPrimaryColor(e.target.value)}
								className="h-8 flex-1"
							/>
						</div>
					</FormField>
				</FormSection>
			</FormCard>
		</PageLayout>
	);
}
