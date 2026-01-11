import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import RichTextEditor from "../components/RichTextEditor";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
	ContentCard,
	ContentCardEmpty,
	ContentCardList,
	ContentCardListItem,
} from "../components/ui/content-card";
import { EntryItem } from "../components/ui/entry-item";
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
	"/dashboard/agents/$agentId/knowledge/text",
)({
	component: AgentKnowledgeText,
});

function AgentKnowledgeText() {
	const { t } = useTranslation();
	const { agentId } = Route.useParams();
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [editingEntry, setEditingEntry] = useState<string | null>(null);

	// Queries and mutations
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const createKnowledgeEntry = useMutation(api.knowledge.createKnowledgeEntry);
	const updateKnowledgeEntry = useMutation(api.knowledge.updateKnowledgeEntry);
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

	// Filter for text entries only
	const textEntries =
		knowledgeEntries?.filter((entry) => entry.source === "text") || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || !title.trim()) return;

		setIsSubmitting(true);
		setError(null);

		try {
			if (editingEntry) {
				await updateKnowledgeEntry({
					entryId: editingEntry as any,
					title: title.trim(),
					content: content,
				});
				setEditingEntry(null);
			} else {
				await createKnowledgeEntry({
					agentId: agentId as any,
					title: title.trim(),
					content: content,
					source: "text",
					sourceMetadata: undefined,
				});
			}

			// Reset form
			setTitle("");
			setContent("");
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving text knowledge:", error);
			setError(
				error instanceof Error ? error.message : t("knowledge.text.saveError"),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (entry: any) => {
		setEditingEntry(entry._id);
		setTitle(entry.title || "");
		setContent(entry.content || "");
	};

	const handleCancelEdit = () => {
		setEditingEntry(null);
		setTitle("");
		setContent("");
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm(t("knowledge.text.deleteError"))) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting text entry:", error);
			setError(
				error instanceof Error
					? error.message
					: t("knowledge.text.deleteError"),
			);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title={t("knowledge.text.title")}
				description={t("knowledge.text.description")}
			/>

			{/* Error/Success Messages */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>{t("knowledge.text.save")}</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title={
						editingEntry ? t("knowledge.text.edit") : t("knowledge.text.addNew")
					}
					description={t("knowledge.text.description")}
					icon={FileText}
				>
					<form onSubmit={handleSubmit}>
						<FormSection>
							<FormField label={t("knowledge.text.entryTitle")} required>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder={t("knowledge.text.entryTitlePlaceholder")}
									required
								/>
							</FormField>

							<FormField label={t("knowledge.text.content")} required>
								<RichTextEditor
									content={content}
									onChange={setContent}
									placeholder={t("knowledge.text.contentPlaceholder")}
									className="min-h-[400px]"
								/>
							</FormField>
						</FormSection>

						<FormActions>
							<Button
								type="button"
								variant="outline"
								onClick={
									editingEntry
										? handleCancelEdit
										: () => {
												setTitle("");
												setContent("");
											}
								}
							>
								{editingEntry ? t("common.cancel") : t("common.cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !content.trim() || !title.trim()}
							>
								{isSubmitting
									? t("knowledge.text.saving")
									: editingEntry
										? t("knowledge.text.update")
										: t("knowledge.text.save")}
							</Button>
						</FormActions>
					</form>
				</FormCard>

				<ContentCard
					title={t("knowledge.text.existing")}
					description={`${textEntries.length} ${t("knowledge.text.name")} ${t("common.entries")}`}
				>
					{textEntries.length === 0 ? (
						<ContentCardEmpty
							icon={FileText}
							title={t("knowledge.text.noEntries")}
							description={t("knowledge.text.noEntriesDesc")}
						/>
					) : (
						<ContentCardList className="max-h-[70vh] overflow-y-auto scrollbar-thin">
							{textEntries.map((entry) => (
								<ContentCardListItem key={entry._id}>
									<EntryItem
										title={entry.title || t("knowledge.untitledEntry")}
										content={entry.content}
										metadata={`Added ${new Date(entry._creationTime).toLocaleDateString()}`}
										onEdit={() => handleEdit(entry)}
										onDelete={() => handleDelete(entry._id)}
									/>
								</ContentCardListItem>
							))}
						</ContentCardList>
					)}
				</ContentCard>
			</TwoColumnLayout>
		</PageLayout>
	);
}
