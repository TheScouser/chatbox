import { Link, createFileRoute } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import {
	BookOpen,
	Brain,
	FileText,
	Globe,
	MessageSquare,
	Plus,
	TrendingUp,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { ContentCard } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";

export const Route = createFileRoute("/dashboard/agents/$agentId/knowledge/")({
	component: AgentKnowledgeOverview,
});

function AgentKnowledgeOverview() {
	const { agentId } = Route.useParams();
	const [isTraining, setIsTraining] = useState(false);
	const [trainingResult, setTrainingResult] = useState<any>(null);

	// Queries and actions
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const generateEmbeddings = useAction(
		api.embeddings.generateEmbeddingsForAgent,
	);

	// Calculate statistics
	const stats = {
		total: knowledgeEntries?.length || 0,
		qna:
			knowledgeEntries?.filter((entry) => entry.source === "qna").length || 0,
		text:
			knowledgeEntries?.filter((entry) => entry.source === "text").length || 0,
		documents:
			knowledgeEntries?.filter((entry) => entry.source === "document").length ||
			0,
		urls:
			knowledgeEntries?.filter((entry) => entry.source === "url").length || 0,
		trained: knowledgeEntries?.filter((entry) => entry.embedding).length || 0,
		untrained:
			knowledgeEntries?.filter((entry) => !entry.embedding).length || 0,
	};

	const knowledgeSources = [
		{
			name: "Q&A",
			description: "Create question and answer pairs for common inquiries",
			icon: MessageSquare,
			href: `/dashboard/agents/${agentId}/knowledge/qna`,
			count: stats.qna,
			color: "bg-yellow-100 text-yellow-800",
		},
		{
			name: "Text",
			description: "Add custom formatted text content",
			icon: FileText,
			href: `/dashboard/agents/${agentId}/knowledge/text`,
			count: stats.text,
			color: "bg-blue-100 text-blue-800",
		},
		{
			name: "Files",
			description: "Upload documents (PDF, DOC, TXT) for automatic processing",
			icon: Upload,
			href: `/dashboard/agents/${agentId}/knowledge/upload`,
			count: stats.documents,
			color: "bg-purple-100 text-purple-800",
		},
		{
			name: "Website",
			description: "Extract content from web pages automatically",
			icon: Globe,
			href: `/dashboard/agents/${agentId}/knowledge/url`,
			count: stats.urls,
			color: "bg-green-100 text-green-800",
		},
	];

	const handleTrainAgent = async () => {
		setIsTraining(true);
		setTrainingResult(null);

		try {
			const result = await generateEmbeddings({
				agentId: agentId as any,
			});
			setTrainingResult(result);
		} catch (error) {
			console.error("Failed to train agent:", error);
			setTrainingResult({
				message:
					error instanceof Error ? error.message : "Failed to train agent",
				processed: 0,
				errors: 1,
			});
		} finally {
			setIsTraining(false);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title="Sources"
				description="Manage your AI agent's knowledge by adding different types of content sources."
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-card border border-border/60 rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<BookOpen className="h-8 w-8 text-primary" />
						<div className="ml-4">
							<p className="text-sm font-medium text-muted-foreground">
								Total Entries
							</p>
							<p className="text-2xl font-semibold text-card-foreground">
								{stats.total}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-card border border-border/60 rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<Brain className="h-8 w-8 text-green-600" />
						<div className="ml-4">
							<p className="text-sm font-medium text-muted-foreground">
								Trained
							</p>
							<p className="text-2xl font-semibold text-card-foreground">
								{stats.trained}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-card border border-border/60 rounded-lg shadow-sm p-6">
					<div className="flex items-center">
						<TrendingUp className="h-8 w-8 text-orange-600" />
						<div className="ml-4">
							<p className="text-sm font-medium text-muted-foreground">
								Needs Training
							</p>
							<p className="text-2xl font-semibold text-card-foreground">
								{stats.untrained}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-card border border-border/60 rounded-lg shadow-sm p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Training Status
							</p>
							<p className="text-lg font-semibold text-card-foreground">
								{stats.total === 0
									? "No data"
									: stats.untrained === 0
										? "Up to date"
										: "Needs update"}
							</p>
						</div>
						{stats.untrained > 0 && (
							<Button
								onClick={handleTrainAgent}
								disabled={isTraining || stats.total === 0}
								size="sm"
							>
								<Brain className="h-4 w-4 mr-1" />
								{isTraining ? "Training..." : "Train"}
							</Button>
						)}
					</div>
				</div>
			</div>

			{trainingResult && (
				<Alert variant={trainingResult.errors > 0 ? "destructive" : "default"}>
					<Brain className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-2">
							<p className="font-medium">
								Training {trainingResult.errors > 0 ? "Failed" : "Complete"}
							</p>
							<p>{trainingResult.message}</p>
							{trainingResult.processed > 0 && (
								<p>Processed {trainingResult.processed} entries</p>
							)}
						</div>
					</AlertDescription>
				</Alert>
			)}

			<div>
				<h2 className="text-lg font-medium text-card-foreground mb-4">
					Sources
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{knowledgeSources.map((source) => {
						const Icon = source.icon;
						return (
							<Link key={source.name} to={source.href}>
								<div className="bg-card border border-border/60 rounded-lg shadow-sm hover:border-border/80 transition-all duration-200 p-6 cursor-pointer group">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center">
											<div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
												<Icon className="h-6 w-6 text-muted-foreground" />
											</div>
											<div className="ml-3">
												<h3 className="text-lg font-medium text-card-foreground">
													{source.name}
												</h3>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${source.color}`}
												>
													{source.count} entries
												</span>
											</div>
										</div>
										<Plus className="h-5 w-5 text-muted-foreground group-hover:text-muted-foreground/80 transition-colors" />
									</div>
									<p className="text-sm text-muted-foreground">
										{source.description}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>

			{stats.total === 0 && (
				<Alert>
					<BookOpen className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-4">
							<div>
								<p className="font-medium mb-2">Add Sources</p>
								<p>
									Your agent needs knowledge to provide helpful responses. Start
									by adding content from any of these sources:
								</p>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{knowledgeSources.map((source) => {
									const Icon = source.icon;
									return (
										<Link key={source.name} to={source.href}>
											<div className="flex items-center p-3 bg-card border border-border/30 rounded-md hover:bg-muted/30 transition-colors">
												<Icon className="h-5 w-5 text-primary mr-3" />
												<div>
													<div className="text-sm font-medium text-card-foreground">
														{source.name}
													</div>
													<div className="text-xs text-muted-foreground">
														{source.description}
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{stats.total > 0 && (
				<ContentCard
					title="Recent Source Entries"
					description="Your latest knowledge additions"
				>
					<div className="border-t border-border/30">
						<div className="divide-y divide-border/30">
							{knowledgeEntries?.slice(0, 5).map((entry) => {
								const getSourceIcon = () => {
									switch (entry.source) {
										case "qna":
											return <MessageSquare className="h-4 w-4" />;
										case "text":
											return <FileText className="h-4 w-4" />;
										case "document":
											return <Upload className="h-4 w-4" />;
										case "url":
											return <Globe className="h-4 w-4" />;
										default:
											return <BookOpen className="h-4 w-4" />;
									}
								};

								const getSourceColor = () => {
									switch (entry.source) {
										case "qna":
											return "text-yellow-600";
										case "text":
											return "text-blue-600";
										case "document":
											return "text-purple-600";
										case "url":
											return "text-green-600";
										default:
											return "text-muted-foreground";
									}
								};

								return (
									<div
										key={entry._id}
										className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors duration-200"
									>
										<div className="flex items-center">
											<div className={`${getSourceColor()}`}>
												{getSourceIcon()}
											</div>
											<div className="ml-3">
												<p className="text-sm font-medium text-card-foreground">
													{entry.title || "Untitled Entry"}
												</p>
												<div className="flex items-center space-x-2 text-xs text-muted-foreground">
													<span className="capitalize">{entry.source}</span>
													<span>•</span>
													<span>
														{new Date(entry._creationTime).toLocaleDateString()}
													</span>
													{entry.embedding && (
														<>
															<span>•</span>
															<span className="text-green-600">Trained</span>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
						{knowledgeEntries && knowledgeEntries.length > 5 && (
							<div className="p-4 text-center border-t border-border/30">
								<p className="text-sm text-muted-foreground">
									Showing 5 of {knowledgeEntries.length} entries
								</p>
							</div>
						)}
					</div>
				</ContentCard>
			)}
		</PageLayout>
	);
}
