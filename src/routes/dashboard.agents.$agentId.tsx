import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, useAction, useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	BookOpen,
	Bot,
	Brain,
	Check,
	Copy,
	Edit,
	ExternalLink,
	FileText,
	Globe,
	Link,
	MessageSquare,
	Plus,
	Settings,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ChatWidget from "../components/ChatWidget";
import DashboardLayout from "../components/DashboardLayout";
import FileUpload from "../components/FileUpload";
import RichTextEditor from "../components/RichTextEditor";

export const Route = createFileRoute("/dashboard/agents/$agentId")({
	component: AgentDetail,
});

function KnowledgeTab({ agentId }: { agentId: string }) {
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [editingEntry, setEditingEntry] = useState<string | null>(null);
	const [activeSection, setActiveSection] = useState<"text" | "upload" | "url">(
		"text",
	);

	// URL-specific state
	const [url, setUrl] = useState("");
	const [urlTitle, setUrlTitle] = useState("");
	const [isProcessingUrl, setIsProcessingUrl] = useState(false);

	// Training state
	const [isTraining, setIsTraining] = useState(false);
	const [trainingResult, setTrainingResult] = useState<{
		message: string;
		processed: number;
		errors: number;
	} | null>(null);

	const createKnowledgeEntry = useMutation(api.knowledge.createKnowledgeEntry);
	const updateKnowledgeEntry = useMutation(api.knowledge.updateKnowledgeEntry);
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const knowledgeStats = useQuery(api.vectorSearch.getKnowledgeStats, {
		agentId: agentId as any,
	});
	const files = useQuery(api.files.getFilesForAgent, {
		agentId: agentId as any,
	});
	const extractText = useAction(api.textExtraction.extractTextFromUploadedFile);
	const processUrl = useAction(api.webCrawling.processUrlContent);
	const generateEmbeddings = useAction(
		api.embeddings.generateEmbeddingsForAgent,
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim() || !title.trim()) return;

		setIsSubmitting(true);
		setError(null);
		setSuccess(false);

		try {
			if (editingEntry) {
				// Update existing entry
				await updateKnowledgeEntry({
					entryId: editingEntry as any,
					title: title.trim(),
					content: content,
				});
				setEditingEntry(null);
			} else {
				// Create new entry
				const knowledgeEntryId = await createKnowledgeEntry({
					agentId: agentId as any, // Type assertion needed for the ID
					title: title.trim(),
					content: content,
					source: "text",
					sourceMetadata: undefined,
				});

				// Generate embeddings for the newly created knowledge entry
				try {
					await generateEmbeddings({
						agentId: agentId as any,
					});
					console.log(`Generated embeddings for new text knowledge entry`);
				} catch (embeddingError) {
					console.error("Failed to generate embeddings:", embeddingError);
					// Don't fail the whole process if embedding generation fails
				}
			}

			// Reset form and show success
			setTitle("");
			setContent("");
			setSuccess(true);

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Failed to save knowledge entry:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to save knowledge entry",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (entry: any) => {
		setEditingEntry(entry._id);
		setTitle(entry.title || "");
		setContent(entry.content);
		setError(null);
		setSuccess(false);
		// Scroll to top of form
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleCancelEdit = () => {
		setEditingEntry(null);
		setTitle("");
		setContent("");
		setError(null);
		setSuccess(false);
	};

	const handleDelete = async (entry: any) => {
		const confirmed = window.confirm(
			`Are you sure you want to delete "${entry.title || "Untitled Entry"}"? This action cannot be undone.`,
		);

		if (!confirmed) return;

		try {
			await deleteKnowledgeEntry({ entryId: entry._id });

			// If we were editing this entry, cancel the edit
			if (editingEntry === entry._id) {
				handleCancelEdit();
			}
		} catch (error) {
			console.error("Failed to delete knowledge entry:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to delete knowledge entry",
			);
		}
	};

	const handleFileUploadComplete = async (fileId: string) => {
		try {
			setSuccess(false);
			setError(null);

			// Trigger text extraction
			await extractText({ fileId: fileId as any });

			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Failed to process uploaded file:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to process uploaded file",
			);
		}
	};

	const handleFileUploadError = (error: string) => {
		setError(error);
		setSuccess(false);
	};

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
			console.error("Failed to process URL:", error);
			setError(
				error instanceof Error ? error.message : "Failed to process URL",
			);
		} finally {
			setIsProcessingUrl(false);
		}
	};

	const handleTrainAgent = async () => {
		setIsTraining(true);
		setError(null);
		setTrainingResult(null);

		try {
			const result = await generateEmbeddings({
				agentId: agentId as any,
			});

			setTrainingResult(result);

			// Clear result after 10 seconds
			setTimeout(() => setTrainingResult(null), 10000);
		} catch (error) {
			console.error("Failed to train agent:", error);
			setError(
				error instanceof Error ? error.message : "Failed to train agent",
			);
		} finally {
			setIsTraining(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900">
					{editingEntry ? "Edit Knowledge Entry" : "Add Knowledge"}
				</h3>
				<p className="mt-1 text-sm text-gray-600">
					{editingEntry
						? "Update the content and title of your knowledge entry."
						: "Create knowledge entries by writing text directly or uploading documents."}
				</p>
				{editingEntry && (
					<button
						onClick={handleCancelEdit}
						className="mt-2 text-sm text-blue-600 hover:text-blue-800"
					>
						← Cancel editing and create new entry
					</button>
				)}
			</div>

			{/* Section Tabs */}
			{!editingEntry && (
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveSection("text")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeSection === "text"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<FileText className="inline-block w-4 h-4 mr-2" />
							Write Text
						</button>
						<button
							onClick={() => setActiveSection("upload")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeSection === "upload"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Upload className="inline-block w-4 h-4 mr-2" />
							Upload Documents
						</button>
						<button
							onClick={() => setActiveSection("url")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeSection === "url"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Globe className="inline-block w-4 h-4 mr-2" />
							Add from URL
						</button>
					</nav>
				</div>
			)}

			{/* Error and Success Messages */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-md p-4">
					<p className="text-sm text-green-600">
						{activeSection === "upload"
							? "File uploaded and processed successfully!"
							: activeSection === "url"
								? "URL content processed successfully!"
								: "Knowledge entry saved successfully!"}
					</p>
				</div>
			)}

			{trainingResult && (
				<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
					<div className="flex items-start">
						<Brain className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
						<div>
							<p className="text-sm font-medium text-blue-800">
								Training Complete
							</p>
							<p className="text-sm text-blue-700 mt-1">
								{trainingResult.message}
							</p>
							{trainingResult.errors > 0 && (
								<p className="text-sm text-orange-700 mt-1">
									{trainingResult.errors} entries failed to process.
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Text Entry Form */}
			{(activeSection === "text" || editingEntry) && (
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Title
						</label>
						<input
							type="text"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
							className="min-h-[300px]"
						/>
					</div>

					<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
						<button
							type="button"
							onClick={
								editingEntry
									? handleCancelEdit
									: () => {
											setTitle("");
											setContent("");
										}
							}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							{editingEntry ? "Cancel" : "Clear"}
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !content.trim() || !title.trim()}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting
								? editingEntry
									? "Updating..."
									: "Saving..."
								: editingEntry
									? "Update Entry"
									: "Save Knowledge Entry"}
						</button>
					</div>
				</form>
			)}

			{/* File Upload Section */}
			{activeSection === "upload" && !editingEntry && (
				<div className="space-y-6">
					<div>
						<h4 className="text-sm font-medium text-gray-900 mb-2">
							Upload Documents
						</h4>
						<p className="text-sm text-gray-600 mb-4">
							Upload PDF, DOC, DOCX, or TXT files. Text will be automatically
							extracted and added to your knowledge base.
						</p>
						<FileUpload
							agentId={agentId}
							onUploadComplete={handleFileUploadComplete}
							onUploadError={handleFileUploadError}
							accept=".pdf,.doc,.docx,.txt"
							maxSize={10}
						/>
					</div>

					{/* Uploaded Files List */}
					{files && files.length > 0 && (
						<div className="mt-6">
							<h4 className="text-sm font-medium text-gray-900 mb-3">
								Uploaded Files
							</h4>
							<div className="space-y-2">
								{files.map((file) => (
									<div
										key={file._id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div className="flex items-center space-x-3">
											<FileText className="h-5 w-5 text-gray-400" />
											<div>
												<p className="text-sm font-medium text-gray-900">
													{file.filename}
												</p>
												<p className="text-xs text-gray-500">
													{(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
													{new Date(file._creationTime).toLocaleDateString()}
												</p>
											</div>
										</div>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												file.status === "processed"
													? "bg-green-100 text-green-800"
													: file.status === "processing"
														? "bg-yellow-100 text-yellow-800"
														: file.status === "error"
															? "bg-red-100 text-red-800"
															: "bg-gray-100 text-gray-800"
											}`}
										>
											{file.status}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* URL Entry Form */}
			{activeSection === "url" && !editingEntry && (
				<form onSubmit={handleUrlSubmit} className="space-y-6">
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start">
							<Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
							<div>
								<h4 className="text-sm font-medium text-blue-800">
									Add Content from URL
								</h4>
								<p className="text-sm text-blue-700 mt-1">
									Enter a webpage URL to automatically extract and add its
									content to your knowledge base.
								</p>
							</div>
						</div>
					</div>

					<div>
						<label
							htmlFor="url"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Website URL
						</label>
						<input
							type="url"
							id="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="https://example.com/page"
							required
						/>
						<p className="mt-1 text-sm text-gray-500">
							Enter the full URL including https:// or http://
						</p>
					</div>

					<div>
						<label
							htmlFor="urlTitle"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Custom Title (Optional)
						</label>
						<input
							type="text"
							id="urlTitle"
							value={urlTitle}
							onChange={(e) => setUrlTitle(e.target.value)}
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Leave blank to use the page title"
						/>
						<p className="mt-1 text-sm text-gray-500">
							If left blank, the page title will be used automatically
						</p>
					</div>

					<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
						<button
							type="button"
							onClick={() => {
								setUrl("");
								setUrlTitle("");
							}}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Clear
						</button>
						<button
							type="submit"
							disabled={isProcessingUrl || !url.trim()}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isProcessingUrl ? "Processing..." : "Add from URL"}
						</button>
					</div>
				</form>
			)}

			{/* Knowledge Entries List */}
			<div className="mt-8 pt-8 border-t border-gray-200">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-medium text-gray-900">
							Knowledge Sources
						</h3>
						{knowledgeStats && (
							<div className="flex items-center gap-4 mt-2">
								<span className="text-sm text-gray-500">
									{knowledgeStats.totalEntries} sources
								</span>
								<div className="flex items-center gap-2 text-xs">
									<span className="text-green-600">
										{knowledgeStats.entriesWithEmbeddings} trained
									</span>
									{knowledgeStats.entriesNeedingEmbeddings > 0 && (
										<>
											<span className="text-gray-300">•</span>
											<span className="text-orange-600">
												{knowledgeStats.entriesNeedingEmbeddings} need training
											</span>
										</>
									)}
									<span className="text-gray-300">•</span>
									<span className="text-gray-500">
										{Math.round(knowledgeStats.embeddingProgress)}% complete
									</span>
								</div>
							</div>
						)}
					</div>
					<div className="flex items-center gap-3">
						{knowledgeStats && knowledgeStats.entriesNeedingEmbeddings > 0 && (
							<button
								onClick={handleTrainAgent}
								disabled={isTraining}
								className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Brain className="h-4 w-4 mr-2" />
								{isTraining ? "Training..." : "Train Agent"}
							</button>
						)}
						{knowledgeEntries && knowledgeEntries.length > 0 && (
							<div className="flex items-center gap-2 text-xs text-gray-500">
								<div className="flex items-center gap-1">
									<FileText className="h-3 w-3 text-blue-500" />
									<span>
										{knowledgeEntries.filter((e) => e.source === "text").length}{" "}
										Text
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Upload className="h-3 w-3 text-purple-500" />
									<span>
										{
											knowledgeEntries.filter((e) => e.source === "document")
												.length
										}{" "}
										Documents
									</span>
								</div>
								<div className="flex items-center gap-1">
									<Globe className="h-3 w-3 text-green-500" />
									<span>
										{knowledgeEntries.filter((e) => e.source === "url").length}{" "}
										URLs
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{knowledgeEntries === undefined ? (
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"
							></div>
						))}
					</div>
				) : knowledgeEntries.length === 0 ? (
					<div className="text-center py-8 bg-gray-50 rounded-lg">
						<BookOpen className="mx-auto h-12 w-12 text-gray-400" />
						<h4 className="mt-2 text-sm font-medium text-gray-900">
							No knowledge sources yet
						</h4>
						<p className="mt-1 text-sm text-gray-500">
							Add your first knowledge source using the tabs above.
						</p>
						<div className="mt-4 flex justify-center gap-2">
							<button
								onClick={() => setActiveSection("text")}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Write text
							</button>
							<span className="text-gray-300">•</span>
							<button
								onClick={() => setActiveSection("upload")}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Upload document
							</button>
							<span className="text-gray-300">•</span>
							<button
								onClick={() => setActiveSection("url")}
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								Add from URL
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{knowledgeEntries.map((entry) => {
							const getSourceIcon = () => {
								switch (entry.source) {
									case "document":
										return <Upload className="h-4 w-4 text-purple-600" />;
									case "url":
										return <Globe className="h-4 w-4 text-green-600" />;
									default:
										return <FileText className="h-4 w-4 text-blue-600" />;
								}
							};

							const getSourceLabel = () => {
								switch (entry.source) {
									case "document":
										return "Document";
									case "url":
										return "URL";
									default:
										return "Text";
								}
							};

							const getSourceMetadata = () => {
								if (
									entry.source === "document" &&
									entry.sourceMetadata?.filename
								) {
									return entry.sourceMetadata.filename;
								}
								if (entry.source === "url" && entry.sourceMetadata?.url) {
									try {
										const url = new URL(entry.sourceMetadata.url);
										return url.hostname;
									} catch {
										return entry.sourceMetadata.url;
									}
								}
								return null;
							};

							return (
								<div
									key={entry._id}
									className={`bg-white border rounded-lg p-4 hover:border-gray-300 transition-colors ${
										editingEntry === entry._id
											? "border-blue-300 bg-blue-50"
											: "border-gray-200"
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
													{getSourceIcon()}
													{entry.title || "Untitled Entry"}
													{editingEntry === entry._id && (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															Editing
														</span>
													)}
												</h4>
											</div>
											<div
												className="text-sm text-gray-600 line-clamp-3 mb-3"
												dangerouslySetInnerHTML={{
													__html:
														entry.content.length > 200
															? entry.content.substring(0, 200) + "..."
															: entry.content,
												}}
											/>
											<div className="flex items-center gap-4 text-xs text-gray-500">
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														entry.source === "document"
															? "bg-purple-100 text-purple-800"
															: entry.source === "url"
																? "bg-green-100 text-green-800"
																: "bg-blue-100 text-blue-800"
													}`}
												>
													{getSourceIcon()}
													<span className="ml-1">{getSourceLabel()}</span>
												</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														entry.embedding
															? "bg-green-100 text-green-800"
															: "bg-orange-100 text-orange-800"
													}`}
												>
													<Brain className="h-3 w-3 mr-1" />
													{entry.embedding ? "Trained" : "Needs Training"}
												</span>
												{getSourceMetadata() && (
													<span className="text-gray-400 truncate max-w-xs">
														{getSourceMetadata()}
													</span>
												)}
												<span>
													Added{" "}
													{new Date(entry._creationTime).toLocaleDateString()}
												</span>
												{entry.source === "url" &&
													entry.sourceMetadata?.url && (
														<a
															href={entry.sourceMetadata.url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
														>
															<ExternalLink className="h-3 w-3" />
															View source
														</a>
													)}
											</div>
										</div>
										<div className="flex items-center space-x-2 ml-4">
											{entry.source !== "url" && (
												<button
													onClick={() => handleEdit(entry)}
													className="text-gray-400 hover:text-blue-600 transition-colors"
													title="Edit entry"
												>
													<svg
														className="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>
											)}
											<button
												onClick={() => handleDelete(entry)}
												className="text-gray-400 hover:text-red-600 transition-colors"
												title="Delete entry"
											>
												<svg
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

function AgentDetail() {
	const navigate = useNavigate();
	const { agentId } = Route.useParams();
	const [activeTab, setActiveTab] = useState<
		"overview" | "knowledge" | "chat" | "conversations" | "settings" | "deploy"
	>("overview");
	const [currentConversationId, setCurrentConversationId] = useState<
		Id<"conversations"> | undefined
	>(undefined);
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	// Customization options
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");
	const [primaryColor, setPrimaryColor] = useState("#2563eb");

	// For now, we'll use a placeholder since we can't query by ID easily
	// In a real implementation, we'd have a getAgentById query
	const agents = useQuery(api.agents.getAgentsForUser);
	const agent = agents?.find((a) => a._id === agentId);

	// Get real statistics for the overview
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const conversations = useQuery(api.conversations.getConversationsForAgent, {
		agentId: agentId as any,
	});
	const knowledgeStats = useQuery(api.vectorSearch.getKnowledgeStats, {
		agentId: agentId as any,
	});

	const tabs = [
		{ id: "overview", name: "Overview", icon: Bot },
		{ id: "knowledge", name: "Knowledge Base", icon: BookOpen },
		{ id: "chat", name: "Chat Playground", icon: MessageSquare },
		{ id: "conversations", name: "Conversations", icon: MessageSquare },
		{ id: "deploy", name: "Deploy", icon: Globe },
		{ id: "settings", name: "Settings", icon: Settings },
	] as const;

	const handleConversationCreate = (conversationId: Id<"conversations">) => {
		setCurrentConversationId(conversationId);
	};

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedCode(type);
			setTimeout(() => setCopiedCode(null), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	// Generate embed URLs
	const baseUrl = window.location.origin;
	const publicChatUrl = `${baseUrl}/chat/${agent?._id}`;
	const embedUrl = `${baseUrl}/embed/${agent?._id}`;
	const iframeCode = `<iframe 
	src="${embedUrl}?primaryColor=${encodeURIComponent(primaryColor)}" 
	width="${embedWidth}" 
	height="${embedHeight}" 
	frameborder="0"
	style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
</iframe>`;

	if (agents === undefined) {
		return (
			<Authenticated>
				<DashboardLayout>
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</DashboardLayout>
			</Authenticated>
		);
	}

	if (!agent) {
		return (
			<Authenticated>
				<DashboardLayout>
					<div className="text-center py-12">
						<Bot className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							Agent not found
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							The agent you're looking for doesn't exist or you don't have
							access to it.
						</p>
						<div className="mt-6">
							<button
								onClick={() => navigate({ to: "/dashboard/agents" })}
								className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Agents
							</button>
						</div>
					</div>
				</DashboardLayout>
			</Authenticated>
		);
	}

	return (
		<Authenticated>
			<DashboardLayout>
				<div className="space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => navigate({ to: "/dashboard/agents" })}
								className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								Back to Agents
							</button>
						</div>
					</div>

					{/* Agent Header */}
					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4">
							<div className="flex items-center">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
									<Bot className="h-7 w-7 text-blue-600" />
								</div>
								<div className="flex-1">
									<h1 className="text-2xl font-bold text-gray-900">
										{agent.name}
									</h1>
									<p className="text-sm text-gray-600 mt-1">
										{agent.description || "No description provided"}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Created {new Date(agent._creationTime).toLocaleDateString()}{" "}
										• Last updated{" "}
										{new Date(agent._creationTime).toLocaleDateString()}
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										Active
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="bg-white shadow rounded-lg">
						<div className="border-b border-gray-200">
							<nav className="-mb-px flex space-x-8 px-6">
								{tabs.map((tab) => {
									const Icon = tab.icon;
									return (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
												activeTab === tab.id
													? "border-blue-500 text-blue-600"
													: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
											}`}
										>
											<Icon
												className={`mr-2 h-5 w-5 ${
													activeTab === tab.id
														? "text-blue-500"
														: "text-gray-400 group-hover:text-gray-500"
												}`}
											/>
											{tab.name}
										</button>
									);
								})}
							</nav>
						</div>

						{/* Tab Content */}
						<div className="p-6">
							{activeTab === "overview" && (
								<div className="space-y-6">
									<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
										<div className="bg-gray-50 rounded-lg p-4">
											<div className="flex items-center">
												<BookOpen className="h-8 w-8 text-blue-500" />
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-500">
														Knowledge Entries
													</p>
													<p className="text-2xl font-semibold text-gray-900">
														{knowledgeEntries?.length || 0}
													</p>
												</div>
											</div>
										</div>
										<div className="bg-gray-50 rounded-lg p-4">
											<div className="flex items-center">
												<MessageSquare className="h-8 w-8 text-green-500" />
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-500">
														Conversations
													</p>
													<p className="text-2xl font-semibold text-gray-900">
														{conversations?.length || 0}
													</p>
												</div>
											</div>
										</div>
										<div className="bg-gray-50 rounded-lg p-4">
											<div className="flex items-center">
												<Brain className="h-8 w-8 text-purple-500" />
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-500">
														Training Progress
													</p>
													<p className="text-2xl font-semibold text-gray-900">
														{knowledgeStats
															? Math.round(knowledgeStats.embeddingProgress)
															: 0}
														%
													</p>
												</div>
											</div>
										</div>
									</div>

									{/* Training Status */}
									{knowledgeStats && (
										<div className="bg-white border border-gray-200 rounded-lg p-6">
											<h3 className="text-lg font-medium text-gray-900 mb-4">
												Knowledge Base Status
											</h3>
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
												<div className="text-center">
													<div className="text-2xl font-bold text-blue-600">
														{knowledgeStats.totalEntries}
													</div>
													<div className="text-sm text-gray-500">
														Total Sources
													</div>
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-green-600">
														{knowledgeStats.entriesWithEmbeddings}
													</div>
													<div className="text-sm text-gray-500">Trained</div>
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-orange-600">
														{knowledgeStats.entriesNeedingEmbeddings}
													</div>
													<div className="text-sm text-gray-500">
														Need Training
													</div>
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-purple-600">
														{Math.round(knowledgeStats.embeddingProgress)}%
													</div>
													<div className="text-sm text-gray-500">Complete</div>
												</div>
											</div>
											{knowledgeStats.entriesNeedingEmbeddings > 0 && (
												<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
													<p className="text-sm text-orange-800">
														<strong>Action needed:</strong>{" "}
														{knowledgeStats.entriesNeedingEmbeddings} knowledge
														sources need training. Go to the Knowledge Base tab
														and click "Train Agent" to improve response quality.
													</p>
												</div>
											)}
										</div>
									)}

									<div className="bg-gray-50 rounded-lg p-6">
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Quick Actions
										</h3>
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
											<button
												onClick={() => setActiveTab("chat")}
												className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
											>
												<MessageSquare className="h-6 w-6 text-green-500 mb-2" />
												<h4 className="font-medium text-gray-900">
													Test Agent
												</h4>
												<p className="text-sm text-gray-600">
													Chat with your agent in the playground
												</p>
											</button>
											<button
												onClick={() => setActiveTab("knowledge")}
												className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
											>
												<BookOpen className="h-6 w-6 text-blue-500 mb-2" />
												<h4 className="font-medium text-gray-900">
													Add Knowledge
												</h4>
												<p className="text-sm text-gray-600">
													Upload documents or add text content
												</p>
											</button>
											<button
												onClick={() => setActiveTab("deploy")}
												className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
											>
												<Globe className="h-6 w-6 text-purple-500 mb-2" />
												<h4 className="font-medium text-gray-900">
													Deploy Agent
												</h4>
												<p className="text-sm text-gray-600">
													Get embed code for your website
												</p>
											</button>
										</div>
									</div>
								</div>
							)}

							{activeTab === "knowledge" && (
								<KnowledgeTab agentId={agent._id} />
							)}

							{activeTab === "chat" && (
								<div className="space-y-6">
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<div className="flex items-start">
											<MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
											<div>
												<h3 className="text-sm font-medium text-blue-800">
													Chat Playground
												</h3>
												<p className="text-sm text-blue-700 mt-1">
													Test your agent by chatting with it directly. This is
													exactly how customers will interact with your agent
													when deployed.
												</p>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
										<div className="lg:col-span-3">
											<ChatWidget
												agentId={agent._id as any}
												conversationId={currentConversationId}
												onConversationCreate={handleConversationCreate}
												height="700px"
												className="border border-gray-200 rounded-lg"
											/>
										</div>

										<div className="space-y-4">
											<div className="bg-white border border-gray-200 rounded-lg p-4">
												<h4 className="text-sm font-medium text-gray-900 mb-3">
													Testing Tips
												</h4>
												<ul className="text-sm text-gray-600 space-y-2">
													<li className="flex items-start">
														<span className="text-green-500 mr-2">•</span>
														Ask questions related to your knowledge base
													</li>
													<li className="flex items-start">
														<span className="text-green-500 mr-2">•</span>
														Test edge cases and unclear queries
													</li>
													<li className="flex items-start">
														<span className="text-green-500 mr-2">•</span>
														Check if responses are accurate and helpful
													</li>
													<li className="flex items-start">
														<span className="text-green-500 mr-2">•</span>
														Verify knowledge sources are being used
													</li>
												</ul>
											</div>

											<div className="bg-white border border-gray-200 rounded-lg p-4">
												<h4 className="text-sm font-medium text-gray-900 mb-3">
													Quick Actions
												</h4>
												<div className="space-y-2">
													<button
														onClick={() => setCurrentConversationId(undefined)}
														className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
													>
														🔄 Start New Conversation
													</button>
													<button
														onClick={() => setActiveTab("knowledge")}
														className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
													>
														📚 Add More Knowledge
													</button>
													<button
														onClick={() => setActiveTab("deploy")}
														className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
													>
														🚀 Deploy Agent
													</button>
												</div>
											</div>

											{currentConversationId && (
												<div className="bg-green-50 border border-green-200 rounded-lg p-4">
													<h4 className="text-sm font-medium text-green-800 mb-2">
														Active Conversation
													</h4>
													<p className="text-xs text-green-700">
														Conversation ID: {currentConversationId}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{activeTab === "conversations" && (
								<div className="space-y-8">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-xl font-medium text-gray-900">
												Chat Logs
											</h3>
											<p className="mt-1 text-sm text-gray-600">
												View and manage all conversations with your agent.
											</p>
										</div>
										<div className="flex items-center gap-3">
											<button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
												<svg
													className="h-4 w-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
													/>
												</svg>
												Refresh
											</button>
											<button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
												<svg
													className="h-4 w-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
													/>
												</svg>
												Filter
											</button>
											<button className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
												<svg
													className="h-4 w-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												Export
											</button>
										</div>
									</div>

									{conversations === undefined ? (
										<div className="animate-pulse">
											<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
												<div className="bg-gray-100 rounded-lg"></div>
												<div className="lg:col-span-3 bg-gray-100 rounded-lg"></div>
											</div>
										</div>
									) : conversations.length === 0 ? (
										<div className="text-center py-16">
											<MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
											<h3 className="mt-4 text-lg font-medium text-gray-900">
												No conversations yet
											</h3>
											<p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
												Conversations will appear here once users start chatting
												with your agent.
											</p>
											<div className="mt-8">
												<button
													onClick={() => setActiveTab("chat")}
													className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
													style={{ marginTop: "1rem" }}
												>
													<MessageSquare className="mr-2 h-4 w-4" />
													Test Your Agent
												</button>
											</div>
										</div>
									) : (
										<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
											{/* Conversations List */}
											<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
												<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
													<h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
														<MessageSquare className="h-5 w-5 text-purple-600" />
														Chat Logs
													</h4>
												</div>
												<div className="overflow-y-auto h-full">
													{conversations.map((conversation, index) => {
														const isSelected =
															currentConversationId === conversation._id;
														const timeAgo = new Date(
															conversation._creationTime,
														);
														const now = new Date();
														const diffInMinutes = Math.floor(
															(now.getTime() - timeAgo.getTime()) / (1000 * 60),
														);
														const diffInHours = Math.floor(diffInMinutes / 60);
														const diffInDays = Math.floor(diffInHours / 24);

														let timeDisplay = "";
														if (diffInMinutes < 60) {
															timeDisplay = `${diffInMinutes} minutes ago`;
														} else if (diffInHours < 24) {
															timeDisplay = `${diffInHours} hours ago`;
														} else {
															timeDisplay = `${diffInDays} days ago`;
														}

														return (
															<div
																key={conversation._id}
																onClick={() =>
																	setCurrentConversationId(conversation._id)
																}
																className={`p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
																	isSelected
																		? "bg-blue-50 border-l-4 border-l-blue-500"
																		: ""
																}`}
															>
																<div className="flex justify-between items-start mb-3">
																	<p className="text-sm font-medium text-gray-900 truncate pr-2 leading-relaxed">
																		{conversation.title ||
																			"Untitled Conversation"}
																	</p>
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			// TODO: Implement delete
																			console.log(
																				"Delete conversation:",
																				conversation._id,
																			);
																		}}
																		className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
																	>
																		<svg
																			className="h-4 w-4"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																			/>
																		</svg>
																	</button>
																</div>
																<p className="text-xs text-gray-500 mb-3">
																	{timeDisplay}
																</p>
																<div className="flex items-center gap-2">
																	<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																		Source: Playground
																	</span>
																</div>
															</div>
														);
													})}
												</div>
											</div>

											{/* Conversation Content */}
											<div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
												{currentConversationId ? (
													<div className="h-full flex flex-col">
														<div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
															<div className="flex items-center justify-between">
																<div>
																	<h4 className="text-xl font-medium text-gray-900">
																		{conversations.find(
																			(c) => c._id === currentConversationId,
																		)?.title || "Conversation Details"}
																	</h4>
																	<p className="text-sm text-gray-500 mt-1">
																		Started{" "}
																		{new Date(
																			conversations.find(
																				(c) => c._id === currentConversationId,
																			)?._creationTime || 0,
																		).toLocaleString()}
																	</p>
																</div>
																<div className="flex items-center gap-2">
																	<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
																		Active
																	</span>
																</div>
															</div>
														</div>
														<div className="flex-1 overflow-hidden">
															<ChatWidget
																agentId={agent._id as any}
																conversationId={currentConversationId}
																onConversationCreate={handleConversationCreate}
																height="100%"
																className="border-0 h-full"
															/>
														</div>
													</div>
												) : (
													<div className="h-full flex items-center justify-center">
														<div className="text-center">
															<MessageSquare className="mx-auto h-20 w-20 text-gray-400" />
															<h3 className="mt-6 text-xl font-medium text-gray-900">
																Select a conversation
															</h3>
															<p className="mt-3 text-sm text-gray-500 max-w-sm">
																Choose a conversation from the list to view its
																details and chat history.
															</p>
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Conversation Stats */}
									{conversations && conversations.length > 0 && (
										<div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
											<h4 className="text-lg font-medium text-gray-900 mb-6">
												Conversation Statistics
											</h4>
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
												<div className="text-center">
													<div className="text-3xl font-bold text-blue-600">
														{conversations.length}
													</div>
													<div className="text-sm text-gray-500 mt-1">
														Total Conversations
													</div>
												</div>
												<div className="text-center">
													<div className="text-3xl font-bold text-green-600">
														{
															conversations.filter((c) => {
																const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
																return c._creationTime > dayAgo;
															}).length
														}
													</div>
													<div className="text-sm text-gray-500 mt-1">
														Last 24 Hours
													</div>
												</div>
												<div className="text-center">
													<div className="text-3xl font-bold text-purple-600">
														{
															conversations.filter((c) => {
																const weekAgo =
																	Date.now() - 7 * 24 * 60 * 60 * 1000;
																return c._creationTime > weekAgo;
															}).length
														}
													</div>
													<div className="text-sm text-gray-500 mt-1">
														Last 7 Days
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}

							{activeTab === "deploy" && (
								<div className="space-y-8">
									<div>
										<h3 className="text-lg font-medium text-gray-900">
											Deploy Your Agent
										</h3>
										<p className="mt-1 text-sm text-gray-600">
											Share your agent with the world using these deployment
											options.
										</p>
									</div>

									{/* Chat Bubble Widget */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
												<div>
													<h4 className="text-sm font-medium text-gray-900">
														Chat Bubble Widget
														<span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															Recommended
														</span>
													</h4>
													<p className="text-sm text-gray-600 mt-1">
														Floating chat bubble that appears on your website.
														Easy one-line installation.
													</p>
												</div>
											</div>
											<a
												href={`${baseUrl}/widget-demo/${agent._id}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:text-blue-800"
											>
												Preview →
											</a>
										</div>
										<div className="mt-4">
											<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
												{`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    window.ChatboxWidget=(...arguments)=>{
      if(!window.ChatboxWidget.q){window.ChatboxWidget.q=[]}
      window.ChatboxWidget.q.push(arguments)
    };
    window.ChatboxWidget=new Proxy(window.ChatboxWidget,{
      get(target,prop){
        if(prop==="q"){return target.q}
        return(...args)=>target(prop,...args)
      }
    })
  }
  const onLoad=function(){
    const script=document.createElement("script");
    script.src="${baseUrl}/widget.min.js";
    script.id="${agent._id}";
    script.domain="${new URL(baseUrl).hostname}";
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`}
											</div>
											<button
												onClick={() =>
													copyToClipboard(
														`<script>
(function(){
  if(!window.ChatboxWidget||window.ChatboxWidget("getState")!=="initialized"){
    window.ChatboxWidget=(...arguments)=>{
      if(!window.ChatboxWidget.q){window.ChatboxWidget.q=[]}
      window.ChatboxWidget.q.push(arguments)
    };
    window.ChatboxWidget=new Proxy(window.ChatboxWidget,{
      get(target,prop){
        if(prop==="q"){return target.q}
        return(...args)=>target(prop,...args)
      }
    })
  }
  const onLoad=function(){
    const script=document.createElement("script");
    script.src="${baseUrl}/widget.min.js";
    script.id="${agent._id}";
    script.domain="${new URL(baseUrl).hostname}";
    document.body.appendChild(script)
  };
  if(document.readyState==="complete"){onLoad()}
  else{window.addEventListener("load",onLoad)}
})();
</script>`,
														"bubble",
													)
												}
												className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
											>
												{copiedCode === "bubble" ? (
													<>
														<Check className="h-4 w-4" />
														Copied!
													</>
												) : (
													<>
														<Copy className="h-4 w-4" />
														Copy Widget Code
													</>
												)}
											</button>
										</div>
									</div>

									{/* Public Chat Link */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<ExternalLink className="h-5 w-5 text-green-600 mt-0.5" />
												<div>
													<h4 className="text-sm font-medium text-gray-900">
														Public Chat Link
													</h4>
													<p className="text-sm text-gray-600 mt-1">
														Direct link for users to chat with your agent
													</p>
												</div>
											</div>
											<a
												href={publicChatUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:text-blue-800"
											>
												Preview →
											</a>
										</div>
										<div className="mt-4">
											<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
												{publicChatUrl}
											</div>
											<button
												onClick={() => copyToClipboard(publicChatUrl, "public")}
												className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
											>
												{copiedCode === "public" ? (
													<>
														<Check className="h-4 w-4 text-green-600" />
														Copied!
													</>
												) : (
													<>
														<Copy className="h-4 w-4" />
														Copy Link
													</>
												)}
											</button>
										</div>
									</div>

									{/* Iframe Embed */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<Globe className="h-5 w-5 text-purple-600 mt-0.5" />
												<div>
													<h4 className="text-sm font-medium text-gray-900">
														Website Embed Code
													</h4>
													<p className="text-sm text-gray-600 mt-1">
														Embed the chat widget directly on your website
													</p>
												</div>
											</div>
											<a
												href={embedUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:text-blue-800"
											>
												Preview →
											</a>
										</div>
										<div className="mt-4">
											<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
												{iframeCode}
											</div>
											<button
												onClick={() => copyToClipboard(iframeCode, "iframe")}
												className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
											>
												{copiedCode === "iframe" ? (
													<>
														<Check className="h-4 w-4 text-green-600" />
														Copied!
													</>
												) : (
													<>
														<Copy className="h-4 w-4" />
														Copy Embed Code
													</>
												)}
											</button>
										</div>
									</div>

									{/* Customization Options */}
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<div className="flex items-start gap-3 mb-6">
											<Settings className="h-5 w-5 text-blue-600 mt-0.5" />
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Customize Widget
												</h4>
												<p className="text-sm text-gray-600 mt-1">
													Adjust the appearance and size of your chat widget
												</p>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
											{/* Width */}
											<div className="space-y-2">
												<Label htmlFor="width" className="text-sm font-medium">
													Width
												</Label>
												<Select
													value={embedWidth}
													onValueChange={setEmbedWidth}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="300">300px</SelectItem>
														<SelectItem value="400">400px</SelectItem>
														<SelectItem value="500">500px</SelectItem>
														<SelectItem value="100%">100%</SelectItem>
													</SelectContent>
												</Select>
											</div>

											{/* Height */}
											<div className="space-y-2">
												<Label htmlFor="height" className="text-sm font-medium">
													Height
												</Label>
												<Select
													value={embedHeight}
													onValueChange={setEmbedHeight}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="400">400px</SelectItem>
														<SelectItem value="500">500px</SelectItem>
														<SelectItem value="600">600px</SelectItem>
														<SelectItem value="700">700px</SelectItem>
													</SelectContent>
												</Select>
											</div>

											{/* Primary Color */}
											<div className="space-y-2">
												<Label htmlFor="color" className="text-sm font-medium">
													Primary Color
												</Label>
												<div className="flex gap-2">
													<Input
														type="color"
														value={primaryColor}
														onChange={(e) => setPrimaryColor(e.target.value)}
														className="w-12 h-10 p-1 border rounded"
													/>
													<Input
														type="text"
														value={primaryColor}
														onChange={(e) => setPrimaryColor(e.target.value)}
														placeholder="#2563eb"
														className="flex-1"
													/>
												</div>
											</div>
										</div>

										{/* Preview */}
										<div className="mt-6 p-4 bg-gray-50 rounded-lg">
											<h5 className="text-sm font-medium text-gray-900 mb-2">
												Preview
											</h5>
											<div className="text-xs text-gray-600 mb-3">
												Widget size: {embedWidth} × {embedHeight}
											</div>
											<div
												className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm"
												style={{
													width:
														embedWidth === "100%" ? "100%" : `${embedWidth}px`,
													height: "120px",
													maxWidth: "100%",
												}}
											>
												<div className="text-center">
													<Bot
														className="h-6 w-6 mx-auto mb-1"
														style={{ color: primaryColor }}
													/>
													<div>Chat Widget Preview</div>
													<div className="text-xs">
														{embedWidth} × {embedHeight}
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Usage Tips */}
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
										<div className="flex items-start gap-3">
											<Settings className="h-5 w-5 text-blue-600 mt-0.5" />
											<div>
												<h4 className="text-sm font-medium text-blue-800">
													Usage Tips
												</h4>
												<div className="mt-3 text-sm text-blue-700 space-y-2">
													<p>
														<strong>Responsive Design:</strong> Use 100% width
														for mobile-friendly widgets
													</p>
													<p>
														<strong>Color Matching:</strong> Choose a primary
														color that matches your brand
													</p>
													<p>
														<strong>Size Guidelines:</strong>
													</p>
													<ul className="mt-1 space-y-1 ml-4">
														<li>• Desktop sidebar: 300-400px wide</li>
														<li>• Full-width mobile: 100% × 500px</li>
														<li>• Popup/modal: 400-500px × 600px</li>
													</ul>
												</div>
											</div>
										</div>
									</div>

									{/* Integration Instructions */}
									<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Integration Instructions
										</h4>
										<div className="space-y-3 text-sm text-gray-600">
											<div>
												<strong>1. Copy the embed code</strong> from above
											</div>
											<div>
												<strong>2. Paste it into your website's HTML</strong>{" "}
												where you want the chat widget to appear
											</div>
											<div>
												<strong>3. Adjust the width and height</strong> as
												needed for your layout
											</div>
											<div>
												<strong>4. Test the integration</strong> to ensure it
												works correctly
											</div>
										</div>
									</div>
								</div>
							)}

							{activeTab === "settings" && (
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium text-gray-900">
											Agent Settings
										</h3>
										<p className="mt-1 text-sm text-gray-600">
											Configure your agent's behavior and appearance.
										</p>
									</div>
									<div className="bg-gray-50 rounded-lg p-6">
										<p className="text-sm text-gray-600">
											Settings panel coming soon...
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</DashboardLayout>
		</Authenticated>
	);
}
