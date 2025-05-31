import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import FileUpload from "../components/FileUpload";
import { FileText, CheckCircle, XCircle, Clock, Upload } from "lucide-react";

export const Route = createFileRoute("/demo/text-extraction")({
	component: TextExtractionDemo,
});

function TextExtractionDemo() {
	const agents = useQuery(api.agents.getAgentsForUser);
	const firstAgent = agents?.[0];

	const files = useQuery(
		api.files.getFilesForAgent,
		firstAgent ? { agentId: firstAgent._id } : "skip",
	);
	const knowledgeEntries = useQuery(
		api.knowledge.getKnowledgeForAgent,
		firstAgent ? { agentId: firstAgent._id } : "skip",
	);
	const extractText = useAction(api.textExtraction.extractTextFromUploadedFile);

	const [processingFiles, setProcessingFiles] = useState<Set<string>>(
		new Set(),
	);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleFileUploadComplete = async (fileId: string) => {
		try {
			setProcessingFiles((prev) => new Set(prev).add(fileId));
			setMessage(null);

			// Trigger text extraction
			await extractText({ fileId: fileId as any });

			setMessage({
				type: "success",
				text: "File uploaded and processed successfully!",
			});
		} catch (error) {
			console.error("Failed to process uploaded file:", error);
			setMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "Failed to process uploaded file",
			});
		} finally {
			setProcessingFiles((prev) => {
				const newSet = new Set(prev);
				newSet.delete(fileId);
				return newSet;
			});
		}
	};

	const handleFileUploadError = (error: string) => {
		setMessage({ type: "error", text: error });
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "processed":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "processing":
				return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
			case "error":
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Upload className="h-5 w-5 text-gray-400" />;
		}
	};

	return (
		<Authenticated>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-6xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-6">
							Text Extraction Demo
						</h1>

						{!firstAgent ? (
							<div className="text-center py-8">
								<p className="text-gray-600">
									You need to create an agent first to test text extraction.
								</p>
								<a
									href="/dashboard/agents/new"
									className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
								>
									Create Agent
								</a>
							</div>
						) : (
							<div className="space-y-8">
								<div>
									<p className="text-gray-600 mb-6">
										Testing text extraction with agent:{" "}
										<strong>{firstAgent.name}</strong>
									</p>

									{message && (
										<div
											className={`mb-6 p-4 rounded-lg ${
												message.type === "success"
													? "bg-green-50 text-green-700"
													: "bg-red-50 text-red-700"
											}`}
										>
											{message.text}
										</div>
									)}

									<div className="mb-6">
										<h2 className="text-lg font-medium text-gray-900 mb-4">
											Upload Documents
										</h2>
										<FileUpload
											agentId={firstAgent._id}
											onUploadComplete={handleFileUploadComplete}
											onUploadError={handleFileUploadError}
											accept=".pdf,.doc,.docx,.txt"
											maxSize={10}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Uploaded Files */}
									<div>
										<h2 className="text-lg font-medium text-gray-900 mb-4">
											Uploaded Files ({files?.length || 0})
										</h2>

										{files === undefined ? (
											<div className="space-y-3">
												{[...Array(3)].map((_, i) => (
													<div
														key={i}
														className="animate-pulse bg-gray-100 rounded-lg p-4 h-16"
													></div>
												))}
											</div>
										) : files.length === 0 ? (
											<div className="text-center py-8 bg-gray-50 rounded-lg">
												<FileText className="mx-auto h-12 w-12 text-gray-400" />
												<p className="mt-2 text-sm text-gray-500">
													No files uploaded yet
												</p>
											</div>
										) : (
											<div className="space-y-3">
												{files.map((file) => (
													<div
														key={file._id}
														className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
													>
														<div className="flex items-center space-x-3">
															<FileText className="h-5 w-5 text-gray-400" />
															<div>
																<p className="text-sm font-medium text-gray-900">
																	{file.filename}
																</p>
																<p className="text-xs text-gray-500">
																	{(file.size / 1024 / 1024).toFixed(2)} MB •
																	{new Date(
																		file._creationTime,
																	).toLocaleDateString()}
																</p>
															</div>
														</div>
														<div className="flex items-center space-x-2">
															{getStatusIcon(file.status)}
															<span
																className={`text-xs font-medium ${
																	file.status === "processed"
																		? "text-green-600"
																		: file.status === "processing"
																			? "text-yellow-600"
																			: file.status === "error"
																				? "text-red-600"
																				: "text-gray-600"
																}`}
															>
																{file.status}
															</span>
														</div>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Knowledge Entries */}
									<div>
										<h2 className="text-lg font-medium text-gray-900 mb-4">
											Knowledge Entries ({knowledgeEntries?.length || 0})
										</h2>

										{knowledgeEntries === undefined ? (
											<div className="space-y-3">
												{[...Array(3)].map((_, i) => (
													<div
														key={i}
														className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"
													></div>
												))}
											</div>
										) : knowledgeEntries.length === 0 ? (
											<div className="text-center py-8 bg-gray-50 rounded-lg">
												<FileText className="mx-auto h-12 w-12 text-gray-400" />
												<p className="mt-2 text-sm text-gray-500">
													No knowledge entries yet
												</p>
											</div>
										) : (
											<div className="space-y-3">
												{knowledgeEntries.map((entry) => (
													<div
														key={entry._id}
														className="p-4 bg-gray-50 rounded-lg"
													>
														<div className="flex items-start justify-between mb-2">
															<h4 className="text-sm font-medium text-gray-900">
																{entry.title || "Untitled Entry"}
															</h4>
															<span
																className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
																	entry.source === "document"
																		? "bg-purple-100 text-purple-800"
																		: "bg-blue-100 text-blue-800"
																}`}
															>
																{entry.source === "document"
																	? "Document"
																	: "Text"}
															</span>
														</div>
														<div
															className="text-xs text-gray-600 line-clamp-2"
															dangerouslySetInnerHTML={{
																__html:
																	entry.content.length > 150
																		? entry.content.substring(0, 150) + "..."
																		: entry.content,
															}}
														/>
														<div className="flex items-center justify-between mt-2 text-xs text-gray-500">
															{entry.sourceMetadata?.filename && (
																<span className="truncate">
																	{entry.sourceMetadata.filename}
																</span>
															)}
															<span>
																{new Date(
																	entry._creationTime,
																).toLocaleDateString()}
															</span>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<div className="mt-8 pt-8 border-t border-gray-200">
									<h2 className="text-lg font-medium text-gray-900 mb-4">
										Phase 5 Status
									</h2>
									<div className="space-y-2 text-sm text-gray-600">
										<div className="flex items-center">
											<span className="text-green-500 mr-2">✓</span>
											Task 5.1: Convex File Storage Setup Complete
										</div>
										<div className="flex items-center">
											<span className="text-green-500 mr-2">✓</span>
											Task 5.2: File Upload Component Complete
										</div>
										<div className="flex items-center">
											<span className="text-green-500 mr-2">✓</span>
											Task 5.3: Text Extraction Action Complete (Basic
											Implementation)
										</div>
										<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
											<p className="text-sm text-yellow-800">
												<strong>Note:</strong> Text extraction currently
												supports TXT files fully. PDF, DOC, and DOCX files show
												placeholder messages. To enable full document
												processing, install libraries like pdf-parse, mammoth,
												or officeparser.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</Authenticated>
	);
}
