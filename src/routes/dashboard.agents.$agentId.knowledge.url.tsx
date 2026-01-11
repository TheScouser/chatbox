import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
	ContentCard,
	ContentCardEmpty,
	ContentCardList,
	ContentCardListItem,
} from "../components/ui/content-card";
import {
	FormActions,
	FormCard,
	FormField,
	FormSection,
} from "../components/ui/form-card";
import { Input } from "../components/ui/input";
import { PageLayout, TwoColumnLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import {
	SkeletonForm,
	SkeletonList,
	SkeletonPageHeader,
} from "../components/ui/skeleton";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/url",
)({
	component: AgentKnowledgeUrl,
});

function AgentKnowledgeUrl() {
	const { t } = useTranslation();
	const { agentId } = Route.useParams();
	const [url, setUrl] = useState("");
	const [urlTitle, setUrlTitle] = useState("");
	const [isProcessingUrl, setIsProcessingUrl] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Queries and actions
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as Id<"agents">,
	});
	const processUrl = useAction(api.webCrawling.processUrlContent);
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);

	// Loading state
	if (knowledgeEntries === undefined) {
		return (
			<PageLayout>
				<SkeletonPageHeader />
				<TwoColumnLayout>
					<SkeletonForm fields={2} />
					<SkeletonList count={4} />
				</TwoColumnLayout>
			</PageLayout>
		);
	}

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
				agentId: agentId as Id<"agents">,
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
				error instanceof Error
					? error.message
					: t("knowledge.url.processError"),
			);
		} finally {
			setIsProcessingUrl(false);
		}
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm(t("knowledge.url.deleteError"))) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as Id<"knowledgeEntries"> });
		} catch (error) {
			console.error("Error deleting URL entry:", error);
			setError(
				error instanceof Error ? error.message : t("knowledge.url.deleteError"),
			);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title={t("knowledge.url.title")}
				description={t("knowledge.url.description")}
			/>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>{t("knowledge.url.addFromUrl")}</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title={t("knowledge.url.addFromUrl")}
					description={t("knowledge.url.description")}
					icon={Globe}
				>
					<FormSection>
						<form onSubmit={handleUrlSubmit} className="space-y-6">
							<Alert>
								<Globe className="h-4 w-4" />
								<AlertDescription>
									<strong>How it works:</strong> Enter a webpage URL to
									automatically extract and add its content to your agent. The
									system will fetch the page content, extract the text, and make
									it searchable for your AI agent.
								</AlertDescription>
							</Alert>

							<FormField label={t("knowledge.url.websiteUrl")} required>
								<Input
									type="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder={t("knowledge.url.websiteUrlPlaceholder")}
									required
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									{t("knowledge.url.websiteUrl")}
								</p>
							</FormField>

							<FormField label={t("knowledge.url.customTitle")}>
								<Input
									type="text"
									value={urlTitle}
									onChange={(e) => setUrlTitle(e.target.value)}
									placeholder={t("knowledge.url.customTitlePlaceholder")}
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									{t("knowledge.url.customTitlePlaceholder")}
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
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={isProcessingUrl || !url.trim()}>
									{isProcessingUrl
										? t("knowledge.url.processing")
										: t("knowledge.url.addFromUrlButton")}
								</Button>
							</FormActions>
						</form>
					</FormSection>
				</FormCard>

				<ContentCard
					title={t("knowledge.url.addedContent")}
					description={`${urlEntries.length} ${t("knowledge.url.name")} ${t("common.entries")}`}
				>
					{urlEntries.length === 0 ? (
						<ContentCardEmpty
							icon={Globe}
							title={t("knowledge.url.noContent")}
							description={t("knowledge.url.noContentDesc")}
						/>
					) : (
						<ContentCardList>
							{urlEntries.map((entry) => {
								/* variable removed */

								return (
									<ContentCardListItem key={entry._id}>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="text-sm font-medium text-card-foreground flex items-center">
													<ExternalLink className="h-4 w-4 mr-2" />
													{entry.title || t("knowledge.untitledEntry")}
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
													<div>
														{entry.content.length > 200
															? `${entry.content.substring(0, 200)}...`
															: entry.content}
													</div>
												</div>
												<div className="mt-2 text-xs text-muted-foreground/80">
													Added{" "}
													{new Date(entry._creationTime).toLocaleDateString()}
												</div>
											</div>
											<div className="flex items-center space-x-2 ml-4">
												{entry.sourceMetadata?.url && (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															entry.sourceMetadata?.url &&
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
