import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { useFormValidation, validators } from "../hooks/useFormValidation";
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
import { Textarea } from "../components/ui/textarea";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/qna",
)({
	component: AgentKnowledgeQnA,
});

type QnAFormData = {
	question: string;
	answer: string;
	title: string;
};

function AgentKnowledgeQnA() {
	const { t } = useTranslation();
	const { agentId } = Route.useParams();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [title, setTitle] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [editingEntry, setEditingEntry] = useState<string | null>(null);

	// Validation schema for Q&A form
	const qnaValidationSchema = {
		question: {
			required: true,
			requiredMessage: t("knowledge.qna.questionRequired"),
			rules: [
				validators.minLength(5, t("knowledge.qna.questionMinLength")),
				validators.maxLength(500, t("knowledge.qna.questionMaxLength")),
			],
		},
		answer: {
			required: true,
			requiredMessage: t("knowledge.qna.answerRequired"),
			rules: [
				validators.minLength(10, t("knowledge.qna.answerMinLength")),
				validators.maxLength(2000, t("knowledge.qna.answerMaxLength")),
			],
		},
		title: {
			required: false,
			rules: [
				validators.maxLength(100, "Title must be less than 100 characters"),
			],
		},
	};

	// Form validation
	const validation = useFormValidation<QnAFormData>(qnaValidationSchema);
	const formData = { question, answer, title };

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
					<SkeletonForm fields={3} />
					<SkeletonList count={4} />
				</TwoColumnLayout>
			</PageLayout>
		);
	}

	// Filter for Q&A entries only
	const qnaEntries =
		knowledgeEntries?.filter((entry) => entry.source === "qna") || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		const { isValid } = validation.validateForm(formData);
		if (!isValid) return;

		setIsSubmitting(true);
		setError(null);

		try {
			if (editingEntry) {
				await updateKnowledgeEntry({
					entryId: editingEntry as any,
					title: title.trim() || question.trim(),
					content: answer,
				});
				setEditingEntry(null);
			} else {
				await createKnowledgeEntry({
					agentId: agentId as any,
					title: title.trim() || question.trim(),
					content: answer,
					source: "qna",
					sourceMetadata: { filename: question.trim() },
				});
			}

			// Reset form
			setQuestion("");
			setAnswer("");
			setTitle("");
			validation.clearErrors();
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Error saving Q&A:", err);
			setError(
				err instanceof Error ? err.message : t("knowledge.qna.saveError"),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (entry: any) => {
		setEditingEntry(entry._id);
		setTitle(entry.title || "");
		setQuestion(entry.sourceMetadata?.question || "");
		setAnswer(entry.content || "");
	};

	const handleCancelEdit = () => {
		setEditingEntry(null);
		setQuestion("");
		setAnswer("");
		setTitle("");
		validation.clearErrors();
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm(t("knowledge.qna.deleteError"))) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting Q&A:", error);
			setError(
				error instanceof Error ? error.message : t("knowledge.qna.deleteError"),
			);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title={t("knowledge.qna.title")}
				description={t("knowledge.qna.description")}
			/>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>{t("knowledge.qna.save")}</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title={
						editingEntry ? t("knowledge.qna.edit") : t("knowledge.qna.addNew")
					}
					description={t("knowledge.qna.description")}
					icon={MessageSquare}
				>
					<FormSection>
						<form onSubmit={handleSubmit}>
							<div className="space-y-6">
								<FormField
									label="Title (Optional)"
									error={validation.getFieldError("title")}
									hint={`${title.length}/100`}
								>
									<Input
										value={title}
										onChange={(e) => {
											setTitle(e.target.value);
											validation.handleChange("title");
										}}
										onBlur={() =>
											validation.handleBlur("title", title, formData)
										}
										placeholder="Ex: Refund requests"
										aria-invalid={Boolean(validation.getFieldError("title"))}
									/>
								</FormField>
								<FormField
									label={t("knowledge.qna.question")}
									required
									error={validation.getFieldError("question")}
									hint={`${question.length}/500`}
								>
									<Input
										value={question}
										onChange={(e) => {
											setQuestion(e.target.value);
											validation.handleChange("question");
										}}
										onBlur={() =>
											validation.handleBlur("question", question, formData)
										}
										placeholder={t("knowledge.qna.questionPlaceholder")}
										aria-invalid={Boolean(validation.getFieldError("question"))}
									/>
								</FormField>
								<FormField
									label={t("knowledge.qna.answer")}
									required
									error={validation.getFieldError("answer")}
									hint={`${answer.length}/2000`}
								>
									<Textarea
										value={answer}
										onChange={(e) => {
											setAnswer(e.target.value);
											validation.handleChange("answer");
										}}
										onBlur={() =>
											validation.handleBlur("answer", answer, formData)
										}
										placeholder={t("knowledge.qna.answerPlaceholder")}
										className="min-h-[300px]"
										aria-invalid={Boolean(validation.getFieldError("answer"))}
									/>
								</FormField>
							</div>
							<FormActions>
								{editingEntry && (
									<Button
										type="button"
										variant="outline"
										onClick={handleCancelEdit}
									>
										{t("common.cancel")}
									</Button>
								)}
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting
										? t("knowledge.qna.saving")
										: editingEntry
											? t("knowledge.qna.update")
											: t("knowledge.qna.save")}
								</Button>
							</FormActions>
						</form>
					</FormSection>
				</FormCard>

				<ContentCard
					title={t("knowledge.qna.existing")}
					description={`${qnaEntries.length} ${t("knowledge.qna.name")} ${t("common.entries")}`}
				>
					{qnaEntries.length === 0 ? (
						<ContentCardEmpty
							icon={MessageSquare}
							title={t("knowledge.qna.noEntries")}
							description={t("knowledge.qna.noEntriesDesc")}
						/>
					) : (
						<ContentCardList className="max-h-[70vh] overflow-y-auto scrollbar-thin">
							{qnaEntries.map((entry) => {
								const questionContent = entry.sourceMetadata?.filename
									? `Q: ${entry.sourceMetadata.filename}\n\nA: ${entry.content}`
									: entry.content;

								return (
									<ContentCardListItem key={entry._id}>
										<EntryItem
											key={entry._id}
											title={entry.title || t("knowledge.untitledEntry")}
											content={questionContent}
											metadata={`Added ${new Date(entry._creationTime).toLocaleDateString()}`}
											onEdit={() => handleEdit(entry)}
											onDelete={() => handleDelete(entry._id)}
										/>
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
