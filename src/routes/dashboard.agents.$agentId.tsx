import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowLeft,
	BookOpen,
	Bot,
	Brain,
	Globe,
	MessageSquare,
	Settings,
	RefreshCw,
	FileText,
	Link,
	Users,
	GlobeIcon,
	TextIcon,
	FileTextIcon,
	MessageCircleReplyIcon,
	MessagesSquareIcon,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/agents/$agentId")({
	component: AgentLayout,
});

function AgentLayout() {
	const navigate = useNavigate();
	const { agentId } = Route.useParams();
	const [isRetraining, setIsRetraining] = useState(false);

	// Get agent data and stats
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const conversations = useQuery(api.conversations.getConversationsForAgent, {
		agentId: agentId as any,
	});
	const knowledgeStats = useQuery(api.vectorSearch.getKnowledgeStats, {
		agentId: agentId as any,
	});

	// Calculate stats for the sidebar
	const textEntries = knowledgeEntries?.filter(entry => entry.source === 'text')?.length || 0;
	const fileEntries = knowledgeEntries?.filter(entry => entry.source === 'document')?.length || 0;
	const urlEntries = knowledgeEntries?.filter(entry => entry.source === 'url')?.length || 0;
	const qnaEntries = knowledgeEntries?.filter(entry => entry.source === 'qna')?.length || 0;

	// Calculate total size (this is a rough estimate - you might want to get actual sizes)
	const totalSize = knowledgeEntries?.reduce((acc, entry) => {
		return acc + (entry.content?.length || 0);
	}, 0) || 0;

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	const handleRetrain = async () => {
		setIsRetraining(true);
		// TODO: Implement retrain functionality
		setTimeout(() => setIsRetraining(false), 2000);
	};

	if (!agent) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex h-screen bg-background">
			{/* Main Content Area */}
			<div className="flex-1 flex">
				{/* Content */}
				<div className="flex-1 overflow-auto p-6">
					<Outlet />
				</div>

				{/* Right Sidebar - Sources Panel */}
				<div className="w-80 border-l border-border/50 bg-card/30 bg-surface-elevated p-4 space-y-4 overflow-auto">
					{/* Sources Header */}
					<h3 className="font-semibold text-foreground">Sources</h3>

					{/* Sources */}
					<div className="space-y-2">
						{textEntries > 0 && (
							<div className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border">
								<div className="flex items-center">
									<TextIcon className="h-4 w-4 text-muted-foreground mr-2" />
									<span className="text-sm">Text Files</span>
								</div>
								<Badge variant="secondary" className="text-xs">{textEntries}</Badge>
							</div>
						)}

						{fileEntries > 0 && (
							<div className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border">
								<div className="flex items-center">
									<FileTextIcon className="h-4 w-4 text-muted-foreground mr-2" />
									<span className="text-sm">Documents</span>
								</div>
								<Badge variant="secondary" className="text-xs">{fileEntries}</Badge>
							</div>
						)}

						{urlEntries > 0 && (
							<div className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border">
								<div className="flex items-center">
									<GlobeIcon className="h-4 w-4 text-muted-foreground mr-2" />
									<span className="text-sm">Website Links</span>
								</div>
								<Badge variant="secondary" className="text-xs">{urlEntries}</Badge>
							</div>
						)}

						{qnaEntries > 0 && (
							<div className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border">
								<div className="flex items-center">
									<MessagesSquareIcon className="h-4 w-4 text-muted-foreground mr-2" />
									<span className="text-sm">Q&A</span>
								</div>
								<Badge variant="secondary" className="text-xs">{qnaEntries}</Badge>
							</div>
						)}

						{knowledgeEntries?.length === 0 && (
							<div className="text-center py-6 text-muted-foreground">
								<FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p className="text-sm">No sources added yet</p>
							</div>
						)}
					</div>

					{/* Stats */}
					{knowledgeEntries && knowledgeEntries.length > 0 && (
						<Card className="p-4">
							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total size</span>
									<span className="font-medium">{formatBytes(totalSize)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Training progress</span>
									<span className="font-medium">
										{knowledgeStats ? Math.round(knowledgeStats.embeddingProgress) : 0}%
									</span>
								</div>
							</div>
						</Card>
					)}

					{/* Action Buttons */}
					<div className="space-y-2">
						<Button
							onClick={handleRetrain}
							disabled={isRetraining || !knowledgeEntries?.length}
							className="w-full"
							size="sm"
						>
							{isRetraining ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Retraining...
								</>
							) : (
								<>
									<Brain className="h-4 w-4 mr-2" />
									Retrain Agent
								</>
							)}
						</Button>

						{knowledgeStats?.entriesNeedingEmbeddings > 0 && (
							<div className="text-xs text-orange-600 text-center mt-2">
								{knowledgeStats.entriesNeedingEmbeddings} sources need training
							</div>
						)}
					</div>

					{/* Agent Info */}
					<Card className="p-4">
						<h4 className="font-medium text-sm mb-3">Agent Info</h4>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status</span>
								<Badge className="bg-green-100 text-green-800">Active</Badge>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Created</span>
								<span className="text-xs">{new Date(agent._creationTime).toLocaleDateString()}</span>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
