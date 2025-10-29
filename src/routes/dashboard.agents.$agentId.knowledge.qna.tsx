import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { PageHeader } from "../components/ui/page-header";
import { PageLayout, TwoColumnLayout } from "../components/ui/layout";
import { Alert, AlertDescription } from "../components/ui/alert";
import { FormCard, FormSection, FormField, FormActions } from "../components/ui/form-card";
import { ContentCard, ContentCardEmpty, ContentCardList, ContentCardListItem } from "../components/ui/content-card";
import { EntryItem } from "../components/ui/entry-item";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/qna",
)({
	component: AgentKnowledgeQnA,
});

function AgentKnowledgeQnA() {
	const { agentId } = Route.useParams();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
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

	// Filter for Q&A entries only
	const qnaEntries =
		knowledgeEntries?.filter((entry) => entry.source === "qna") || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!question.trim() || !answer.trim()) return;

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
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving Q&A:", error);
			setError(error instanceof Error ? error.message : "Failed to save Q&A");
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
								<FormField label="Title (Optional)">
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Ex: Refund requests"
									/>
								</FormField>
								<FormField label="Question" required>
									<Input
										value={question}
										onChange={(e) => setQuestion(e.target.value)}
										placeholder="Ex: How do I request a refund?"
										required
									/>
								</FormField>
								<FormField label="Answer" required>
									<Textarea
										value={answer}
										onChange={(e) => setAnswer(e.target.value)}
										placeholder="Enter your answer..."
										className="min-h-[300px]"
										required
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
									disabled={isSubmitting || !question.trim() || !answer.trim()}
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
