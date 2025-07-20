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
import { Button } from "../components/ui/button";

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
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
				<p className="mt-1 text-sm text-gray-500">
					Manage your AI agent's knowledge by adding different types of content
					sources.
				</p>
			</div>

			{/* Knowledge Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<BookOpen className="h-8 w-8 text-blue-600" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Total Entries</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.total}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<Brain className="h-8 w-8 text-green-600" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Trained</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.trained}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<TrendingUp className="h-8 w-8 text-orange-600" />
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">
								Needs Training
							</p>
							<p className="text-2xl font-semibold text-gray-900">
								{stats.untrained}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-500">
								Training Status
							</p>
							<p className="text-lg font-semibold text-gray-900">
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

			{/* Training Result */}
			{trainingResult && (
				<div
					className={`rounded-md p-4 ${
						trainingResult.errors > 0
							? "bg-red-50 border border-red-200"
							: "bg-green-50 border border-green-200"
					}`}
				>
					<div className="flex">
						<div className="flex-shrink-0">
							<Brain
								className={`h-5 w-5 ${
									trainingResult.errors > 0 ? "text-red-400" : "text-green-400"
								}`}
							/>
						</div>
						<div className="ml-3">
							<h3
								className={`text-sm font-medium ${
									trainingResult.errors > 0 ? "text-red-800" : "text-green-800"
								}`}
							>
								Training {trainingResult.errors > 0 ? "Failed" : "Complete"}
							</h3>
							<div
								className={`mt-2 text-sm ${
									trainingResult.errors > 0 ? "text-red-700" : "text-green-700"
								}`}
							>
								<p>{trainingResult.message}</p>
								{trainingResult.processed > 0 && (
									<p>Processed {trainingResult.processed} entries</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Knowledge Sources Grid */}
			<div>
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Knowledge Sources
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{knowledgeSources.map((source) => {
						const Icon = source.icon;
						return (
							<Link key={source.name} to={source.href}>
								<div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer group">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center">
											<div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
												<Icon className="h-6 w-6 text-gray-600" />
											</div>
											<div className="ml-3">
												<h3 className="text-lg font-medium text-gray-900">
													{source.name}
												</h3>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${source.color}`}
												>
													{source.count} entries
												</span>
											</div>
										</div>
										<Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
									</div>
									<p className="text-sm text-gray-500">{source.description}</p>
								</div>
							</Link>
						);
					})}
				</div>
			</div>

			{/* Getting Started Section */}
			{stats.total === 0 && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<div className="flex items-start">
						<BookOpen className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
						<div>
							<h3 className="text-lg font-medium text-blue-900 mb-2">
								Build Your Knowledge Base
							</h3>
							<p className="text-blue-800 mb-4">
								Your agent needs knowledge to provide helpful responses. Start
								by adding content from any of these sources:
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{knowledgeSources.map((source) => {
									const Icon = source.icon;
									return (
										<Link key={source.name} to={source.href}>
											<div className="flex items-center p-3 bg-white rounded-md hover:bg-blue-50 transition-colors">
												<Icon className="h-5 w-5 text-blue-600 mr-3" />
												<div>
													<div className="text-sm font-medium text-blue-900">
														{source.name}
													</div>
													<div className="text-xs text-blue-700">
														{source.description}
													</div>
												</div>
											</div>
										</Link>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Recent Activity */}
			{stats.total > 0 && (
				<div className="bg-white rounded-lg shadow">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Recent Knowledge Entries
						</h3>
						<div className="space-y-3">
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
											return "text-gray-600";
									}
								};

								return (
									<div
										key={entry._id}
										className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
									>
										<div className="flex items-center">
											<div className={`${getSourceColor()}`}>
												{getSourceIcon()}
											</div>
											<div className="ml-3">
												<p className="text-sm font-medium text-gray-900">
													{entry.title || "Untitled Entry"}
												</p>
												<div className="flex items-center space-x-2 text-xs text-gray-500">
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
							<div className="mt-4 text-center">
								<p className="text-sm text-gray-500">
									Showing 5 of {knowledgeEntries.length} entries
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
