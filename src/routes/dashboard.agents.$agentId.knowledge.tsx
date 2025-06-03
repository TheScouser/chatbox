import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import {
	BookOpen,
	Brain,
	ExternalLink,
	FileText,
	Globe,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import ChatWidget from "../components/ChatWidget";
import FileUpload from "../components/FileUpload";
import RichTextEditor from "../components/RichTextEditor";

export const Route = createFileRoute("/dashboard/agents/$agentId/knowledge")({
	component: AgentKnowledge,
});

function AgentKnowledge() {
	const { agentId } = Route.useParams();
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
				<h3 className="text-2xl font-bold text-gray-900">
					Knowledge Base
				</h3>
				<p className="mt-1 text-gray-600">
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
				<div className="bg-white shadow rounded-lg p-6">
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
				</div>
			)}

			{/* File Upload Section */}
			{activeSection === "upload" && !editingEntry && (
				<div className="bg-white shadow rounded-lg p-6 space-y-6">
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
				<div className="bg-white shadow rounded-lg p-6">
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
				</div>
			)}

			{/* Knowledge Entries List */}
			<div className="bg-white shadow rounded-lg p-6">
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