import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { PageHeader } from "../components/ui/page-header";
import { PageLayout, TwoColumnLayout } from "../components/ui/layout";
import { Alert, AlertDescription } from "../components/ui/alert";
import { FormCard, FormSection, FormField, FormActions } from "../components/ui/form-card";
import { ContentCard, ContentCardEmpty, ContentCardList, ContentCardListItem } from "../components/ui/content-card";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/url",
)({
	component: AgentKnowledgeUrl,
});

function AgentKnowledgeUrl() {
	const { agentId } = Route.useParams();
	const [url, setUrl] = useState("");
	const [urlTitle, setUrlTitle] = useState("");
	const [isProcessingUrl, setIsProcessingUrl] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Queries and actions
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const processUrl = useAction(api.webCrawling.processUrlContent);
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);

	// Filter for URL entries only
	const urlEntries =
		knowledgeEntries?.filter((entry) => entry.source === "url") || [];

	const handleUrlSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setIsProcessingUrl(true);
		setError(null);
		setSuccess(false);

		try {
			await processUrl({
				agentId: agentId as any,
				url: url.trim(),
				title: urlTitle.trim() || undefined,
			});

			// Reset form and show success
			setUrl("");
			setUrlTitle("");
			setSuccess(true);

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Error processing URL:", error);
			setError(
				error instanceof Error ? error.message : "Failed to process URL",
			);
		} finally {
			setIsProcessingUrl(false);
		}
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm("Are you sure you want to delete this URL entry?")) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting URL entry:", error);
			setError(
				error instanceof Error ? error.message : "Failed to delete URL entry",
			);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title="Website Source"
				description="Add content from websites by providing URLs. The content will be automatically extracted and added to your agent."
			/>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>
						URL content processed successfully!
					</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title="Add Content from URL"
					description="Enter a webpage URL to automatically extract and add its content to your agent."
					icon={Globe}
				>
					<FormSection>
						<form onSubmit={handleUrlSubmit} className="space-y-6">
							<Alert>
								<Globe className="h-4 w-4" />
								<AlertDescription>
									<strong>How it works:</strong> Enter a webpage URL to automatically extract and add its content to your agent. The system will fetch the page content, extract the text, and make it searchable for your AI agent.
								</AlertDescription>
							</Alert>

							<FormField label="Website URL" required>
								<Input
									type="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://example.com/page"
									required
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									Enter the full URL including https:// or http://
								</p>
							</FormField>

							<FormField label="Custom Title (Optional)">
								<Input
									type="text"
									value={urlTitle}
									onChange={(e) => setUrlTitle(e.target.value)}
									placeholder="Leave blank to use the page title"
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									If left blank, the page title will be used automatically
								</p>
							</FormField>

							<FormActions>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setUrl("");
										setUrlTitle("");
									}}
								>
									Clear
								</Button>
								<Button type="submit" disabled={isProcessingUrl || !url.trim()}>
									{isProcessingUrl ? "Processing..." : "Add from URL"}
								</Button>
							</FormActions>
						</form>
					</FormSection>
				</FormCard>

				<ContentCard
					title="Added Website Content"
					description={`${urlEntries.length} website entries in your knowledge base`}
				>
					{urlEntries.length === 0 ? (
						<ContentCardEmpty
							icon={Globe}
							title="No website content yet"
							description="Add your first website content using the form."
						/>
					) : (
						<ContentCardList>
							{urlEntries.map((entry) => {
								const urlMetadata = entry.sourceMetadata?.url ? (
									<a
										href={entry.sourceMetadata.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										{entry.sourceMetadata.url}
									</a>
								) : `Added ${new Date(entry._creationTime).toLocaleDateString()}`;

								return (
									<ContentCardListItem key={entry._id}>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="text-sm font-medium text-card-foreground flex items-center">
													<ExternalLink className="h-4 w-4 mr-2" />
													{entry.title || "Untitled URL"}
												</h4>
												{entry.sourceMetadata?.url && (
													<p className="mt-1 text-sm">
														<a
															href={entry.sourceMetadata.url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-primary hover:underline"
														>
															{entry.sourceMetadata.url}
														</a>
													</p>
												)}
												<div className="mt-2 text-sm text-muted-foreground prose prose-sm max-w-none">
													<div
														dangerouslySetInnerHTML={{
															__html: entry.content.length > 200
																? entry.content.substring(0, 200) + "..."
																: entry.content,
														}}
													/>
												</div>
												<div className="mt-2 text-xs text-muted-foreground/80">
													Added {new Date(entry._creationTime).toLocaleDateString()}
												</div>
											</div>
											<div className="flex items-center space-x-2 ml-4">
												{entry.sourceMetadata?.url && (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															window.open(entry.sourceMetadata.url, "_blank")
														}
													>
														Visit
													</Button>
												)}
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(entry._id)}
													className="text-destructive hover:text-destructive/80 border-destructive/20 hover:border-destructive/30"
												>
													Delete
												</Button>
											</div>
										</div>
									</ContentCardListItem>
								);
							})}
						</ContentCardList>
					)}
				</ContentCard>
			</TwoColumnLayout>
		</PageLayout>
	);
}
