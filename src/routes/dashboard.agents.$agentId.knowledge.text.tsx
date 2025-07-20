import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { FileText } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import RichTextEditor from "../components/RichTextEditor";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/text",
)({
	component: AgentKnowledgeText,
});

function AgentKnowledgeText() {
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
				error instanceof Error
					? error.message
					: "Failed to save text knowledge",
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
		if (!confirm("Are you sure you want to delete this text entry?")) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting text entry:", error);
			setError(
				error instanceof Error ? error.message : "Failed to delete text entry",
			);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Text Knowledge</h1>
				<p className="mt-1 text-sm text-gray-500">
					Add custom text content to your agent's knowledge base using rich text
					formatting.
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
					<p className="text-sm text-green-600">
						Text knowledge saved successfully!
					</p>
				</div>
			)}

			{/* Side-by-side layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				{/* Left side - Text Form */}
				<div className="bg-white shadow rounded-lg">
				<div className="p-6">
					<h3 className="text-lg font-medium text-gray-900 flex items-center">
						<FileText className="h-5 w-5 mr-2" />
						{editingEntry ? "Edit Text Knowledge" : "Add New Text Knowledge"}
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Create formatted text content that your AI agent can reference in
						conversations.
					</p>
				</div>
				<form
					onSubmit={handleSubmit}
					className="p-6 border-t border-gray-200 space-y-6"
				>
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Title
						</label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter a title for this knowledge entry..."
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Content
						</label>
						<RichTextEditor
							content={content}
							onChange={setContent}
							placeholder="Start writing your knowledge content..."
							className="min-h-[400px]"
						/>
					</div>

					<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
							{editingEntry ? "Cancel" : "Clear"}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || !content.trim() || !title.trim()}
						>
							{isSubmitting
								? editingEntry
									? "Updating..."
									: "Saving..."
								: editingEntry
									? "Update Entry"
									: "Save Knowledge Entry"}
						</Button>
					</div>
				</form>
			</div>

			{/* Right side - Existing Text Entries */}
			<div className="bg-white shadow rounded-lg">
				<div className="p-6">
					<h3 className="text-lg font-medium text-gray-900">
						Existing Text Entries
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{textEntries.length} text entries in your knowledge base
					</p>
				</div>
				{textEntries.length === 0 ? (
					<div className="p-6 border-t border-gray-200 text-center">
						<FileText className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							No text entries yet
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Get started by creating your first text knowledge entry.
						</p>
					</div>
				) : (
					<div className="border-t border-gray-200">
						<div className="divide-y divide-gray-200">
							{textEntries.map((entry) => (
								<div key={entry._id} className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="text-sm font-medium text-gray-900">
												{entry.title || "Untitled Entry"}
											</h4>
											<div
												className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none"
												dangerouslySetInnerHTML={{
													__html:
														entry.content.length > 150
															? entry.content.substring(0, 150) + "..."
															: entry.content,
												}}
											/>
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
