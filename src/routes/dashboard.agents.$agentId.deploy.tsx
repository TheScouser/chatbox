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
		<div className="space-y-4">
			<div>
				<h3 className="text-xl font-semibold text-gray-900">
					Deploy Your Agent
				</h3>
				<p className="mt-1 text-sm text-gray-600">
					Share your agent with the world using these deployment options.
				</p>
			</div>

			{/* Embed */}
			<div className="space-y-3">
				<h4 className="text-base font-medium text-gray-900">Embed</h4>
				<div className="flex gap-4">
					{/* Chat Bubble Widget */}
					<div className="flex-1 min-w-0 bg-white border rounded-lg p-4 border-blue-500">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								{/* <input type="radio" name="embed-type" defaultChecked className="w-4 h-4 text-blue-600" /> */}
								<span className="text-sm font-medium">Embed a chat bubble</span>
								<span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
									Recommended
								</span>
							</div>
							<a
								href={`${baseUrl}/widget-demo/${agent._id}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-blue-600 hover:text-blue-800"
							>
								Preview →
							</a>
						</div>
						<p className="text-xs text-gray-600 mb-3">
							Embed a chat bubble on your website. Allows you to use all the
							advanced features of the agent. Explore the{" "}
							<a href="#" className="text-blue-600 hover:underline">
								docs.
							</a>
						</p>
						<div className="bg-gray-50 rounded p-2 mb-2 h-16 overflow-x-auto overflow-y-hidden">
							<code className="text-xs text-gray-800 font-mono whitespace-nowrap">
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
    script.src="${baseUrl}/widget.min.js";
    script.id="${agent._id}";
    script.domain="${new URL(baseUrl).hostname}";
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`}
							</code>
						</div>
						<button
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
    script.src="${baseUrl}/widget.min.js";
    script.id="${agent._id}";
    script.domain="${new URL(baseUrl).hostname}";
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`,
									"bubble",
								)
							}
							className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800"
						>
							{copiedCode === "bubble" ? (
								<>
									<Check className="h-3 w-3" />
									Copied!
								</>
							) : (
								<>
									<Copy className="h-3 w-3" />
									Copy
								</>
							)}
						</button>
					</div>

					{/* Iframe Embed */}
					<div className="flex-1 min-w-0 bg-white border rounded-lg p-4">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								{/* <input type="radio" name="embed-type" className="w-4 h-4 text-blue-600" /> */}
								<span className="text-sm font-medium">
									Embed the iframe directly
								</span>
							</div>
							<a
								href={embedUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-blue-600 hover:text-blue-800"
							>
								Preview →
							</a>
						</div>
						<p className="text-xs text-gray-600 mb-3">
							Add the agent anywhere on your website
						</p>
						<div className="bg-gray-50 rounded p-2 mb-2 h-16 overflow-x-auto overflow-y-hidden">
							<code className="text-xs text-gray-800 font-mono whitespace-nowrap">
								{iframeCode}
							</code>
						</div>
						<button
							onClick={() => copyToClipboard(iframeCode, "iframe")}
							className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800"
						>
							{copiedCode === "iframe" ? (
								<>
									<Check className="h-3 w-3" />
									Copied!
								</>
							) : (
								<>
									<Copy className="h-3 w-3" />
									Copy
								</>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Configuration */}
			<div className="space-y-3">
				<h4 className="text-base font-medium text-gray-900">Configuration</h4>

				<div className="bg-white border rounded-lg p-4 space-y-4">
					<div>
						<h5 className="text-sm font-medium text-gray-700 mb-2">
							On the site
						</h5>
						<div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
							{new URL(baseUrl).hostname}
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<Label htmlFor="width" className="text-xs text-gray-600">
									Width
								</Label>
								<Input
									id="width"
									value={embedWidth}
									onChange={(e) => setEmbedWidth(e.target.value)}
									className="h-8 text-xs"
								/>
							</div>
							<div className="flex-1">
								<Label htmlFor="height" className="text-xs text-gray-600">
									Height
								</Label>
								<Input
									id="height"
									value={embedHeight}
									onChange={(e) => setEmbedHeight(e.target.value)}
									className="h-8 text-xs"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="color" className="text-xs text-gray-600">
								Primary Color
							</Label>
							<div className="flex items-center gap-2">
								<Input
									id="color"
									type="color"
									value={primaryColor}
									onChange={(e) => setPrimaryColor(e.target.value)}
									className="h-8 w-16"
								/>
								<Input
									value={primaryColor}
									onChange={(e) => setPrimaryColor(e.target.value)}
									className="h-8 text-xs flex-1"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
