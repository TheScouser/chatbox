import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
	const { agentId } = Route.useParams();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	// Queries and mutations
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as Id<"agents">,
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
	const groupedDocumentEntries = documentEntries.reduce((acc: Array<{
		_id: string;
		groupKey: string;
		filename?: string | null;
		size: number;
		status: string;
		_creationTime: number;
		chunks: Doc<"knowledgeEntries">[];
	}>, entry) => {
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

	const handleFileUploadComplete = (result: string) => {
		console.log("File upload completed:", result);
		setSuccess(true);
		setTimeout(() => setSuccess(false), 3000);
	};

	const handleFileUploadError = (errorMessage: string) => {
		setError(errorMessage);
		setTimeout(() => setError(null), 5000);
	};

	const handleDeleteFile = async (file: {
		chunks: Array<{ _id: string }>;
	}) => {
		if (!confirm(t("knowledge.upload.deleteError"))) return;

		try {
			// Delete all chunks for this file
			for (const chunk of file.chunks) {
				await deleteKnowledgeEntry({ entryId: chunk._id as Id<"knowledgeEntries"> });
			}
		} catch (error) {
			console.error("Error deleting file:", error);
			setError(
				error instanceof Error
					? error.message
					: t("knowledge.upload.deleteError"),
			);
		}
	};

	return (
		<PageLayout>
			<PageHeader
				title={t("knowledge.upload.title")}
				description={t("knowledge.upload.description")}
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
						{t("knowledge.upload.uploadTitle")}
					</AlertDescription>
				</Alert>
			)}

			<TwoColumnLayout>
				<FormCard
					title={t("knowledge.upload.uploadTitle")}
					description={t("knowledge.upload.description")}
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
					title={t("knowledge.upload.uploadedFiles")}
					description={`${groupedDocumentEntries.length} ${t("knowledge.upload.name")}`}
				>
					{groupedDocumentEntries.length === 0 ? (
						<ContentCardEmpty
							icon={FileText}
							title={t("knowledge.upload.noFiles")}
							description={t("knowledge.upload.noFilesDesc")}
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
												? t("knowledge.upload.processingFailed")
												: file.status === "error"
													? t("knowledge.upload.processingFailed")
													: t("knowledge.upload.noContentExtracted")
											: file.chunks
													.sort((a, b) => {
														const extractPartNumber = (title: string | undefined) => {
															if (!title) return 0;
															const match = title.match(/Part (\d+)\/\d+/);
															return match
																? Number.parseInt(match[1], 10)
																: 0;
														};
														const aPartNum = extractPartNumber(a.title);
														const bPartNum = extractPartNumber(b.title);
														if (aPartNum > 0 && bPartNum > 0) {
															return aPartNum - bPartNum;
														}
														return (
															a._creationTime - b._creationTime
														);
													})
													.map((chunk) => chunk.content)
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
