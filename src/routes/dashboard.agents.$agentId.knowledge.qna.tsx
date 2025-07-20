import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

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
					sourceMetadata: { question: question.trim() },
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
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Q&A Knowledge</h1>
				<p className="mt-1 text-sm text-gray-500">
					Craft responses for important questions, ensuring your AI Agent shares
					the most relevant info.
				</p>
			</div>

			{/* Error/Success Messages */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-md p-4">
					<p className="text-sm text-green-600">Q&A saved successfully!</p>
				</div>
			)}

			{/* Side-by-side layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				{/* Left side - Q&A Form */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900 flex items-center">
							<MessageSquare className="h-5 w-5 mr-2" />
							{editingEntry ? "Edit Q&A" : "Add New Q&A"}
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Create question and answer pairs to help your AI agent respond
							accurately to common inquiries.
						</p>
					</div>
					<form
						onSubmit={handleSubmit}
						className="p-6 border-t border-gray-200"
					>
						<div className="space-y-6">
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Title (Optional)
								</label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Ex: Refund requests"
								/>
							</div>
							<div>
								<label
									htmlFor="question"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Question
								</label>
								<Input
									id="question"
									value={question}
									onChange={(e) => setQuestion(e.target.value)}
									placeholder="Ex: How do I request a refund?"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Answer
								</label>
								<Textarea
									value={answer}
									onChange={(e) => setAnswer(e.target.value)}
									placeholder="Enter your answer..."
									className="min-h-[300px]"
									required
								/>
							</div>
						</div>
						<div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
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
						</div>
					</form>
				</div>

				{/* Right side - Existing Q&A Entries */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900">
							Existing Q&A Entries
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{qnaEntries.length} Q&A entries in your knowledge base
						</p>
					</div>
					{qnaEntries.length === 0 ? (
						<div className="p-6 border-t border-gray-200 text-center">
							<MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No Q&A entries yet
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Get started by creating your first question and answer pair.
							</p>
						</div>
					) : (
						<div className="border-t border-gray-200">
							<div className="divide-y divide-gray-200">
								{qnaEntries.map((entry) => (
									<div key={entry._id} className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="text-sm font-medium text-gray-900">
													{entry.title || "Untitled Q&A"}
												</h4>
												{entry.sourceMetadata?.question && (
													<p className="mt-1 text-sm text-gray-600">
														<strong>Q:</strong> {entry.sourceMetadata.question}
													</p>
												)}
												<div className="mt-2 text-sm text-gray-600">
													<strong>A:</strong>{" "}
													{entry.content.length > 100
														? entry.content.substring(0, 100) + "..."
														: entry.content}
												</div>
												<div className="mt-2 text-xs text-gray-500">
													Added{" "}
													{new Date(entry._creationTime).toLocaleDateString()}
												</div>
											</div>
											<div className="flex items-center space-x-2 ml-4">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleEdit(entry)}
												>
													Edit
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(entry._id)}
													className="text-red-600 hover:text-red-700"
												>
													Delete
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
