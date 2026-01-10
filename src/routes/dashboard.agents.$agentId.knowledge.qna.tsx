import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
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

// Validation schema for Q&A form
const qnaValidationSchema = {
	question: {
		required: true,
		requiredMessage: "Question is required",
		rules: [
			validators.minLength(5, "Question must be at least 5 characters"),
			validators.maxLength(500, "Question must be less than 500 characters"),
		],
	},
	answer: {
		required: true,
		requiredMessage: "Answer is required",
		rules: [
			validators.minLength(10, "Answer must be at least 10 characters"),
			validators.maxLength(10000, "Answer must be less than 10,000 characters"),
		],
	},
	title: {
		required: false,
		rules: [
			validators.maxLength(100, "Title must be less than 100 characters"),
		],
	},
};

type QnAFormData = {
	question: string;
	answer: string;
	title: string;
};

function AgentKnowledgeQnA() {
	const { agentId } = Route.useParams();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [title, setTitle] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [editingEntry, setEditingEntry] = useState<string | null>(null);

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
			setError(err instanceof Error ? err.message : "Failed to save Q&A");
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
		if (!confirm("Are you sure you want to delete this Q&A?")) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting Q&A:", error);
			setError(error instanceof Error ? error.message : "Failed to delete Q&A");
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title="Q&A Source"
				description="Craft responses for important questions, ensuring your AI Agent shares the most relevant info."
			/>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>Q&A source saved successfully!</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title={editingEntry ? "Edit Q&A" : "Add New Q&A"}
					description="Create question and answer pairs to help your AI agent respond accurately to common inquiries."
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
										onBlur={() => validation.handleBlur("title", title, formData)}
										placeholder="Ex: Refund requests"
										aria-invalid={Boolean(validation.getFieldError("title"))}
									/>
								</FormField>
								<FormField
									label="Question"
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
										onBlur={() => validation.handleBlur("question", question, formData)}
										placeholder="Ex: How do I request a refund?"
										aria-invalid={Boolean(validation.getFieldError("question"))}
									/>
								</FormField>
								<FormField
									label="Answer"
									required
									error={validation.getFieldError("answer")}
									hint={`${answer.length}/10,000`}
								>
									<Textarea
										value={answer}
										onChange={(e) => {
											setAnswer(e.target.value);
											validation.handleChange("answer");
										}}
										onBlur={() => validation.handleBlur("answer", answer, formData)}
										placeholder="Enter your answer..."
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
										Cancel
									</Button>
								)}
								<Button
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting
										? editingEntry
											? "Updating Q&A..."
											: "Adding Q&A..."
										: editingEntry
											? "Update Q&A"
											: "Add Q&A"}
								</Button>
							</FormActions>
						</form>
					</FormSection>
				</FormCard>

				<ContentCard
					title="Existing Q&A Entries"
					description={`${qnaEntries.length} Q&A entries in your knowledge base`}
				>
					{qnaEntries.length === 0 ? (
						<ContentCardEmpty
							icon={MessageSquare}
							title="No Q&A entries yet"
							description="Get started by creating your first question and answer pair."
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
											title={entry.title || "Untitled Q&A"}
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
