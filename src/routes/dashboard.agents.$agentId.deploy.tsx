import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Check,
	Copy,
	Globe,
	Settings,
	Code2,
	Layout,
	Eye,
	Palette,
	Maximize2,
	ChevronRight
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { ContentCardEmpty } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

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

	return (
		<PageLayout>
			<PageHeader
				title="Deployment"
				description="Integrate your AI agent into any website or application in seconds."
			>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => window.open(`${baseUrl}/widget-demo/${agent._id}`, "_blank")}>
						<Eye className="h-3.5 w-3.5 mr-2" />
						Live Demo
					</Button>
					<Button size="sm">
						<Globe className="h-3.5 w-3.5 mr-2" />
						Public Link
					</Button>
				</div>
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
									<p className="text-xs text-muted-foreground font-medium">Customize the appearance and behavior</p>
								</div>
							</div>
							<Badge variant="outline" className="bg-background/50">Production Ready</Badge>
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
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">PX</span>
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
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40">PX</span>
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
											This color will be used for buttons, icons, and highlights
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Implementation Methods */}
					<div className="space-y-6">
						<h2 className="text-lg font-bold flex items-center gap-3 px-1">
							<Code2 className="h-5 w-5 text-primary" />
							Integration Methods
						</h2>

						{/* Method: Bubble Widget */}
						<Card className="bg-card/30 backdrop-blur-sm border-border/40 overflow-hidden group animate-fade-in-up stagger-1">
							<div className="p-5 border-b border-border/40 flex items-center justify-between group-hover:bg-muted/10 transition-colors">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
										<Layout className="h-4 w-4 text-primary" />
									</div>
									<div>
										<h4 className="text-sm font-bold">Chat Bubble Widget</h4>
										<p className="text-[10px] text-muted-foreground font-semibold">Recommended for most websites</p>
									</div>
								</div>
								<Badge variant="default" className="text-[8px] h-4">Most Popular</Badge>
							</div>
							<div className="p-5">
								<div className="relative group/code">
									<div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-48 custom-scrollbar">
										<pre><code>{widgetScript}</code></pre>
									</div>
									<Button
										size="icon"
										variant="glass"
										className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-opacity"
										onClick={() => copyToClipboard(widgetScript, "bubble")}
									>
										{copiedCode === "bubble" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
									</Button>
								</div>
								<div className="mt-4 flex items-center justify-between">
									<p className="text-[10px] text-muted-foreground font-medium pr-8">
										Paste this code snippet right before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag of your website.
									</p>
									<Button
										size="sm"
										className="h-8 shadow-none"
										onClick={() => copyToClipboard(widgetScript, "bubble")}
									>
										{copiedCode === "bubble" ? "Copied!" : "Copy Snippet"}
									</Button>
								</div>
							</div>
						</Card>

						{/* Method: Iframe */}
						<Card className="bg-card/30 backdrop-blur-sm border-border/40 overflow-hidden group animate-fade-in-up stagger-2">
							<div className="p-5 border-b border-border/40 flex items-center justify-between group-hover:bg-muted/10 transition-colors">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
										<Maximize2 className="h-4 w-4 text-primary" />
									</div>
									<div>
										<h4 className="text-sm font-bold">Direct Iframe</h4>
										<p className="text-[10px] text-muted-foreground font-semibold">Best for specific layout blocks</p>
									</div>
								</div>
							</div>
							<div className="p-5">
								<div className="relative group/code">
									<div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed custom-scrollbar">
										<pre><code>{iframeCode}</code></pre>
									</div>
									<Button
										size="icon"
										variant="glass"
										className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover/code:opacity-100 transition-opacity"
										onClick={() => copyToClipboard(iframeCode, "iframe")}
									>
										{copiedCode === "iframe" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
									</Button>
								</div>
								<div className="mt-4 flex items-center justify-between">
									<p className="text-[10px] text-muted-foreground font-medium pr-8">
										Use this to embed the agent inside a specific container or page section.
									</p>
									<Button
										size="sm"
										className="h-8 shadow-none"
										onClick={() => copyToClipboard(iframeCode, "iframe")}
									>
										{copiedCode === "iframe" ? "Copied!" : "Copy Snippet"}
									</Button>
								</div>
							</div>
						</Card>
					</div>
				</div>

				{/* Right Column: Preview */}
				<div className="w-full lg:col-span-5 sticky top-24 animate-fade-in-left">
					<div className="relative">
						{/* Device Frame */}
						<div className="bg-zinc-950 rounded-[2.5rem] p-4 border-[8px] border-zinc-900 shadow-2xl overflow-hidden aspect-[9/16] max-h-[700px] mx-auto w-full max-w-[360px]">
							<div className="w-1/3 h-6 bg-zinc-900 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-10" />
							<div className="h-full w-full bg-background rounded-[1.5rem] overflow-hidden relative">
								{/* Mock Website Background */}
								<div className="p-6 space-y-4 opacity-20 pointer-events-none">
									<div className="h-6 w-1/3 bg-muted rounded-md" />
									<div className="space-y-2">
										<div className="h-4 bg-muted rounded-md" />
										<div className="h-4 w-5/6 bg-muted rounded-md" />
										<div className="h-4 w-4/6 bg-muted rounded-md" />
									</div>
									<div className="h-32 bg-muted rounded-xl" />
									<div className="grid grid-cols-2 gap-4">
										<div className="h-10 bg-muted rounded-md" />
										<div className="h-10 bg-muted rounded-md" />
									</div>
								</div>

								{/* The Actual Widget Iframe Replay */}
								<div className="absolute inset-x-0 bottom-0 h-full">
									<iframe
										src={`${embedUrl}?primaryColor=${encodeURIComponent(primaryColor)}`}
										className="w-full h-full border-0 animate-fade-in"
										title="Preview"
									/>
								</div>
							</div>
						</div>

						{/* Floating Labels */}
						<div className="absolute -bottom-6 inset-x-0 text-center">
							<Badge variant="outline" className="bg-card w-auto py-1.5 px-4 shadow-lg border-border/60">
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
