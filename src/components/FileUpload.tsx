import { useMutation } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface FileUploadProps {
	agentId: string;
	onUploadComplete?: (fileId: string) => void;
	onUploadError?: (error: string) => void;
	accept?: string;
	maxSize?: number; // in MB
	className?: string;
}

interface UploadingFile {
	file: File;
	progress: number;
	status: "uploading" | "processing" | "complete" | "error";
	error?: string;
}

export default function FileUpload({
	agentId,
	onUploadComplete,
	onUploadError,
	accept = ".pdf,.doc,.docx,.txt",
	maxSize = 10,
	className = "",
}: FileUploadProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const saveFileMetadata = useMutation(api.files.saveFileMetadata);

	const validateFile = useCallback(
		(file: File): string | null => {
			// Check file size
			if (file.size > maxSize * 1024 * 1024) {
				return `File size must be less than ${maxSize}MB`;
			}

			// Check file type
			const allowedTypes = accept.split(",").map((type) => type.trim());
			const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

			if (!allowedTypes.includes(fileExtension)) {
				return `File type not supported. Allowed types: ${accept}`;
			}

			return null;
		},
		[maxSize, accept],
	);

	const uploadFile = useCallback(
		async (file: File) => {
		const uploadingFile: UploadingFile = {
			file,
			progress: 0,
			status: "uploading",
		};

		setUploadingFiles((prev) => [...prev, uploadingFile]);

		try {
			// Step 1: Generate upload URL
			uploadingFile.progress = 10;
			setUploadingFiles((prev) =>
				prev.map((f) => (f.file === file ? uploadingFile : f)),
			);

			const postUrl = await generateUploadUrl();

			// Step 2: Upload file
			uploadingFile.progress = 30;
			setUploadingFiles((prev) =>
				prev.map((f) => (f.file === file ? uploadingFile : f)),
			);

			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await result.json();

			// Step 3: Save metadata
			uploadingFile.progress = 80;
			uploadingFile.status = "processing";
			setUploadingFiles((prev) =>
				prev.map((f) => (f.file === file ? uploadingFile : f)),
			);

			const fileId = await saveFileMetadata({
				storageId,
				agentId: agentId as Id<"agents">,
				filename: file.name,
				contentType: file.type,
				size: file.size,
			});

			// Complete
			uploadingFile.progress = 100;
			uploadingFile.status = "complete";
			setUploadingFiles((prev) =>
				prev.map((f) => (f.file === file ? uploadingFile : f)),
			);

			onUploadComplete?.(fileId);

			// Remove from list after 2 seconds
			setTimeout(() => {
				setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
			}, 2000);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Upload failed";
			uploadingFile.status = "error";
			uploadingFile.error = errorMessage;
			setUploadingFiles((prev) =>
				prev.map((f) => (f.file === file ? uploadingFile : f)),
			);
			onUploadError?.(errorMessage);
		}
		},
		[agentId, generateUploadUrl, saveFileMetadata, onUploadComplete, onUploadError],
	);

	const handleFiles = useCallback(
		(files: FileList) => {
			for (const file of Array.from(files)) {
				const error = validateFile(file);
				if (error) {
					onUploadError?.(error);
					return;
				}
				uploadFile(file);
			}
		},
		[validateFile, uploadFile, onUploadError],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFiles(files);
			}
		},
		[handleFiles],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files) {
				handleFiles(files);
			}
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[handleFiles],
	);

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Drop Zone */}
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
					isDragOver
						? "border-primary bg-primary/5"
						: "border-border hover:border-muted-foreground/50"
				}`}
			>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept={accept}
					onChange={handleFileSelect}
					className="sr-only"
					id="file-upload"
				/>

				<svg
					className="mx-auto h-12 w-12 text-muted-foreground"
					stroke="currentColor"
					fill="none"
					viewBox="0 0 48 48"
					role="img"
					aria-label="File upload icon"
				>
					<title>File upload icon</title>
					<path
						d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>

				<div className="mt-4">
					<label htmlFor="file-upload" className="cursor-pointer">
						<span className="mt-2 block text-sm font-medium text-foreground">
							{isDragOver
								? "Drop files here"
								: "Drop files here or click to browse"}
						</span>
					</label>
					<p className="mt-2 text-sm text-muted-foreground">
						{accept.replace(/\./g, "").toUpperCase()} up to {maxSize}MB
					</p>
				</div>
			</div>

			{/* Upload Progress */}
			{uploadingFiles.length > 0 && (
				<div className="space-y-3">
					{uploadingFiles.map((uploadingFile) => (
						<div key={uploadingFile.file.name} className="bg-muted/30 rounded-lg p-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-foreground truncate">
									{uploadingFile.file.name}
								</span>
								<span className="text-xs text-gray-500">
									{(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
								</span>
							</div>

							<div className="w-full bg-muted rounded-full h-2 mb-2">
								<div
									className={`h-2 rounded-full transition-all duration-300 ${
										uploadingFile.status === "error"
											? "bg-destructive"
											: uploadingFile.status === "complete"
												? "bg-green-500"
												: "bg-primary"
									}`}
									style={{ width: `${uploadingFile.progress}%` }}
								/>
							</div>

							<div className="flex items-center justify-between">
								<span
									className={`text-xs ${
										uploadingFile.status === "error"
											? "text-destructive"
											: uploadingFile.status === "complete"
												? "text-green-600"
												: "text-primary"
									}`}
								>
									{uploadingFile.status === "uploading" && "Uploading..."}
									{uploadingFile.status === "processing" && "Processing..."}
									{uploadingFile.status === "complete" && "Complete!"}
									{uploadingFile.status === "error" &&
										(uploadingFile.error || "Error")}
								</span>
								<span className="text-xs text-gray-500">
									{uploadingFile.progress}%
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
