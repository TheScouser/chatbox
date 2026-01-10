import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import FileUpload from "../components/FileUpload";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
	ContentCard,
	ContentCardEmpty,
	ContentCardList,
	ContentCardListItem,
} from "../components/ui/content-card";
import { EntryItem } from "../components/ui/entry-item";
import { FormCard } from "../components/ui/form-card";
import { PageLayout, TwoColumnLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import {
	Skeleton,
	SkeletonList,
	SkeletonPageHeader,
} from "../components/ui/skeleton";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/upload",
)({
	component: AgentKnowledgeUpload,
});

function AgentKnowledgeUpload() {
	const { agentId } = Route.useParams();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	// Queries and mutations
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);
	// const extractText = useAction(api.knowledge.extractTextFromFile);

	// Loading state
	if (knowledgeEntries === undefined) {
		return (
			<PageLayout>
				<SkeletonPageHeader />
				<TwoColumnLayout>
					<div className="rounded-xl border bg-card p-6 space-y-4">
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-48 w-full rounded-lg border-2 border-dashed" />
					</div>
					<SkeletonList count={4} />
				</TwoColumnLayout>
			</PageLayout>
		);
	}

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
		<PageLayout>
			<PageHeader
				title="File Sources"
				description="Upload documents to automatically extract and add their content to your agent."
			/>

			{/* Error/Success Messages */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert>
					<AlertDescription>
						File uploaded and processed successfully!
					</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title="Upload Documents"
					description="Upload PDF, DOC, DOCX, or TXT files. Text will be automatically extracted and added to your agent."
					icon={Upload}
				>
					<FileUpload
						agentId={agentId}
						onUploadComplete={handleFileUploadComplete}
						onUploadError={handleFileUploadError}
						accept=".pdf,.doc,.docx,.txt"
						maxSize={10}
					/>
				</FormCard>

				<ContentCard
					title="Uploaded Files"
					description={`${groupedDocumentEntries.length} files in your sources`}
				>
					{groupedDocumentEntries.length === 0 ? (
						<ContentCardEmpty
							icon={FileText}
							title="No files uploaded yet"
							description="Upload your first document using the form."
						/>
					) : (
						<ContentCardList>
							{groupedDocumentEntries.map((file) => (
								<ContentCardListItem key={file._id}>
									<EntryItem
										title={file.filename}
										content={
											file.chunks.length === 0
												? file.status === "processing"
													? "Processing file content..."
													: file.status === "error"
														? "Failed to process file"
														: "No content extracted"
												: file.chunks
														.sort((a: any, b: any) => {
															const extractPartNumber = (title: string) => {
																const match = title.match(/Part (\d+)\/\d+/);
																return match
																	? Number.parseInt(match[1], 10)
																	: 0;
															};
															const aPartNum = extractPartNumber(a.title || "");
															const bPartNum = extractPartNumber(b.title || "");
															if (aPartNum > 0 && bPartNum > 0) {
																return aPartNum - bPartNum;
															}
															return (
																(a._creationTime || 0) - (b._creationTime || 0)
															);
														})
														.map((chunk: any) => chunk.content)
														.join("")
										}
										metadata={`${file.status} • ${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.chunks.length} chunks • Uploaded ${new Date(file._creationTime).toLocaleDateString()}`}
										onDelete={() => handleDeleteFile(file)}
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
