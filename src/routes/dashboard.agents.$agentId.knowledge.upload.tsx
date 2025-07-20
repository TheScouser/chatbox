import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import FileUpload from "../components/FileUpload";
import { Button } from "../components/ui/button";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/upload",
)({
	component: AgentKnowledgeUpload,
});

function AgentKnowledgeUpload() {
	const { agentId } = Route.useParams();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [expandedFile, setExpandedFile] = useState<string | null>(null);

	// Queries and mutations
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);
	const extractText = useAction(api.knowledge.extractTextFromFile);

	// Get uploaded files with their chunks
	const documentEntries =
		knowledgeEntries?.filter((entry) => entry.source === "document") || [];

	// Group by fileId or filename to show files with their chunks
	const groupedDocumentEntries = documentEntries.reduce((acc: any[], entry) => {
		// Use fileId if available, otherwise group by filename
		const groupKey =
			entry.sourceMetadata?.fileId ||
			entry.sourceMetadata?.filename ||
			entry.title;
		const existingFile = acc.find((file) => file.groupKey === groupKey);

		if (existingFile) {
			existingFile.chunks.push(entry);
			// Update file info with the latest values if they exist
			if (entry.sourceMetadata?.fileSize && !existingFile.size) {
				existingFile.size = entry.sourceMetadata.fileSize;
			}
			if (entry.sourceMetadata?.status) {
				existingFile.status = entry.sourceMetadata.status;
			}
		} else {
			acc.push({
				_id: entry.sourceMetadata?.fileId || entry._id,
				groupKey: groupKey,
				filename: entry.sourceMetadata?.filename || entry.title,
				size: entry.sourceMetadata?.fileSize || 0,
				status: entry.sourceMetadata?.status || "processed",
				_creationTime: entry._creationTime,
				chunks: [entry],
			});
		}
		return acc;
	}, []);

	const handleFileUploadComplete = (result: any) => {
		console.log("File upload completed:", result);
		setSuccess(true);
		setTimeout(() => setSuccess(false), 3000);
	};

	const handleFileUploadError = (errorMessage: string) => {
		setError(errorMessage);
		setTimeout(() => setError(null), 5000);
	};

	const handleDeleteFile = async (file: any) => {
		if (
			!confirm("Are you sure you want to delete this file and all its content?")
		)
			return;

		try {
			// Delete all chunks for this file
			for (const chunk of file.chunks) {
				await deleteKnowledgeEntry({ entryId: chunk._id as any });
			}
		} catch (error) {
			console.error("Error deleting file:", error);
			setError(
				error instanceof Error ? error.message : "Failed to delete file",
			);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
				<p className="mt-1 text-sm text-gray-500">
					Upload documents to automatically extract and add their content to
					your knowledge base.
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
						File uploaded and processed successfully!
					</p>
				</div>
			)}

			{/* Side-by-side layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				{/* Left side - File Upload Section */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900 flex items-center">
							<Upload className="h-5 w-5 mr-2" />
							Upload Documents
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Upload PDF, DOC, DOCX, or TXT files. Text will be automatically
							extracted and added to your knowledge base.
						</p>
					</div>
					<div className="p-6 border-t border-gray-200">
						<FileUpload
							agentId={agentId}
							onUploadComplete={handleFileUploadComplete}
							onUploadError={handleFileUploadError}
							accept=".pdf,.doc,.docx,.txt"
							maxSize={10}
						/>
					</div>
				</div>

				{/* Right side - Uploaded Files */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900">
							Uploaded Files
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{groupedDocumentEntries.length} files in your knowledge base
						</p>
					</div>
					{groupedDocumentEntries.length === 0 ? (
						<div className="p-6 border-t border-gray-200 text-center">
							<FileText className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No files uploaded yet
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Upload your first document using the form.
							</p>
						</div>
					) : (
						<div className="border-t border-gray-200">
							<div className="divide-y divide-gray-200">
								{groupedDocumentEntries.map((file) => (
									<div key={file._id}>
										<button
											onClick={() =>
												setExpandedFile(
													expandedFile === file._id ? null : file._id,
												)
											}
											className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<FileText className="h-5 w-5 text-gray-400" />
													<div className="ml-3">
														<p className="text-sm font-medium text-gray-900">
															{file.filename}
														</p>
														<p className="text-xs text-gray-500">
															{(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
															{file.chunks.length} chunks • Uploaded{" "}
															{new Date(
																file._creationTime,
															).toLocaleDateString()}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-2">
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
													<Button
														size="sm"
														variant="outline"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteFile(file);
														}}
														className="text-red-600 hover:text-red-700"
													>
														Delete
													</Button>
												</div>
											</div>
										</button>
										{expandedFile === file._id && (
											<div className="p-6 border-t border-gray-200 bg-gray-50">
												{file.chunks.length === 0 ? (
													<div className="text-center py-6">
														{file.status === "processing" ? (
															<div className="flex items-center justify-center space-x-2">
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
																<span className="text-sm text-gray-600">
																	Processing file content...
																</span>
															</div>
														) : file.status === "error" ? (
															<div className="text-red-600">
																<p className="text-sm font-medium">
																	Failed to process file
																</p>
																<p className="text-xs mt-1">
																	Try re-uploading the file or check if it's a
																	supported format.
																</p>
																<Button
																	size="sm"
																	onClick={async () => {
																		try {
																			await extractText({
																				fileId: file._id as any,
																			});
																		} catch (error) {
																			console.error(
																				"Failed to retry processing:",
																				error,
																			);
																		}
																	}}
																	className="mt-2"
																>
																	Retry Processing
																</Button>
															</div>
														) : (
															<div className="text-yellow-600">
																<p className="text-sm font-medium">
																	No content extracted
																</p>
																<p className="text-xs mt-1">
																	The file may be empty, image-based, or in an
																	unsupported format.
																</p>
															</div>
														)}
													</div>
												) : (
													<div className="space-y-3">
														<h4 className="text-sm font-medium text-gray-900">
															Extracted Content
														</h4>
														<div className="p-4 bg-white rounded-md border">
															<div className="text-sm text-gray-700 whitespace-pre-wrap">
																{file.chunks
																	.sort((a: any, b: any) => {
																		// Extract part numbers from titles like "filename (Part 1/11)"
																		const extractPartNumber = (
																			title: string,
																		) => {
																			const match =
																				title.match(/Part (\d+)\/\d+/);
																			return match
																				? Number.parseInt(match[1], 10)
																				: 0;
																		};

																		const aPartNum = extractPartNumber(
																			a.title || "",
																		);
																		const bPartNum = extractPartNumber(
																			b.title || "",
																		);

																		// If both have part numbers, sort by part number
																		if (aPartNum > 0 && bPartNum > 0) {
																			return aPartNum - bPartNum;
																		}

																		// Fallback to creation time if no part numbers
																		return (
																			(a._creationTime || 0) -
																			(b._creationTime || 0)
																		);
																	})
																	.map((chunk: any) => chunk.content)
																	.join("")}
															</div>
															<div className="mt-3 text-xs text-gray-500 border-t pt-2">
																{file.chunks.length} chunks combined • Total
																length:{" "}
																{file.chunks
																	.reduce(
																		(total: number, chunk: any) =>
																			total + (chunk.content?.length || 0),
																		0,
																	)
																	.toLocaleString()}{" "}
																characters
															</div>
														</div>
													</div>
												)}
											</div>
										)}
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
