import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

type WidgetConfig = {
	branding: {
		logoStorageId?: Id<"_storage">;
		primaryColor: string;
		foregroundColor: string;
		showHeaderIcon: boolean;
		headerIconCircular: boolean;
		botAvatarCircular: boolean;
		botAvatarType: "logo" | "custom";
		botAvatarStorageId?: Id<"_storage">;
	};
};

interface BrandingTabProps {
	config: WidgetConfig;
	onChange: (updates: Partial<WidgetConfig>) => void;
	agentId: Id<"agents">;
}

function FormSection({
	title,
	children,
}: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			{children}
		</div>
	);
}

function ColorPicker({
	label,
	value,
	onChange,
	description,
}: {
	label: string;
	value: string;
	onChange: (color: string) => void;
	description?: string;
}) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
			<div className="flex gap-2">
				<Input
					type="color"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-16 h-10 p-1 border rounded cursor-pointer"
				/>
				<Input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="#2563eb"
					className="flex-1"
				/>
			</div>
		</div>
	);
}

function ToggleRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<Label className="text-sm">{label}</Label>
			<Switch checked={checked} onCheckedChange={onChange} />
		</div>
	);
}

function FileDropzone({
	onUpload,
	previewStorageId,
	onRemove,
}: {
	onUpload: (storageId: Id<"_storage">) => void;
	previewStorageId?: Id<"_storage">;
	onRemove?: () => void;
}) {
	const [isDragOver, setIsDragOver] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const getFileUrl = useMutation(api.files.getFileUrl);

	// Load preview if storageId provided
	const loadPreview = useCallback(async () => {
		if (previewStorageId) {
			try {
				const url = await getFileUrl({ storageId: previewStorageId });
				setPreviewUrl(url);
			} catch (error) {
				console.error("Error loading preview:", error);
			}
		}
	}, [previewStorageId, getFileUrl]);

	useEffect(() => {
		loadPreview();
	}, [loadPreview]);

	const handleFileSelect = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}
		if (file.size > 1024 * 1024) {
			alert("File size must be less than 1MB");
			return;
		}

		try {
			const postUrl = await generateUploadUrl();
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await result.json();
			onUpload(storageId as Id<"_storage">);
		} catch (error) {
			console.error("Error uploading file:", error);
			alert("Failed to upload file");
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	return (
		<div
			onDrop={handleDrop}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
				isDragOver ? "border-primary bg-primary/5" : "border-border"
			}`}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={(e) => {
					const files = e.target.files;
					if (files && files.length > 0) {
						handleFileSelect(files[0]);
					}
				}}
				className="sr-only"
			/>

			{previewUrl ? (
				<div className="relative inline-block">
					<img
						src={previewUrl}
						alt="Preview"
						className="max-w-full max-h-32 rounded"
					/>
					{onRemove && (
						<Button
							type="button"
							variant="destructive"
							size="icon"
							className="absolute top-0 right-0 h-6 w-6"
							onClick={onRemove}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			) : (
				<>
					<Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="text-sm font-medium text-primary hover:underline"
					>
						Click to upload
					</button>
					<p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
				</>
			)}
		</div>
	);
}

export function BrandingTab({ config, onChange, agentId }: BrandingTabProps) {
	const handleLogoUpload = (storageId: Id<"_storage">) => {
		onChange({
			branding: {
				...config.branding,
				logoStorageId: storageId,
			},
		});
	};

	const handleAvatarUpload = (storageId: Id<"_storage">) => {
		onChange({
			branding: {
				...config.branding,
				botAvatarStorageId: storageId,
			},
		});
	};

	return (
		<div className="space-y-8">
			{/* Logo section */}
			<FormSection title="Logo">
				<FileDropzone
					onUpload={handleLogoUpload}
					previewStorageId={config.branding.logoStorageId}
					onRemove={() =>
						onChange({
							branding: {
								...config.branding,
								logoStorageId: undefined,
							},
						})
					}
				/>
				<p className="text-xs text-muted-foreground">
					Recommended size: 200x200px
					<br />
					Supported: JPG/PNG/WEBP/GIF (max 1MB)
				</p>
			</FormSection>

			{/* Colors section */}
			<FormSection title="Colors">
				<div className="space-y-4">
					<ColorPicker
						label="Primary color"
						value={config.branding.primaryColor}
						onChange={(color) =>
							onChange({
								branding: { ...config.branding, primaryColor: color },
							})
						}
					/>
					<ColorPicker
						label="Foreground color"
						description="Texts, icons, and other visual elements"
						value={config.branding.foregroundColor}
						onChange={(color) =>
							onChange({
								branding: { ...config.branding, foregroundColor: color },
							})
						}
					/>
				</div>
			</FormSection>

			{/* Header Icon section */}
			<FormSection title="Header Icon">
				<div className="space-y-3">
					<ToggleRow
						label="Show icon"
						checked={config.branding.showHeaderIcon}
						onChange={(v) =>
							onChange({
								branding: { ...config.branding, showHeaderIcon: v },
							})
						}
					/>
					<ToggleRow
						label="Circular shape"
						checked={config.branding.headerIconCircular}
						onChange={(v) =>
							onChange({
								branding: { ...config.branding, headerIconCircular: v },
							})
						}
					/>
				</div>
			</FormSection>

			{/* Bot Avatar section */}
			<FormSection title="Bot Avatar">
				<div className="space-y-3">
					<ToggleRow
						label="Circular shape"
						checked={config.branding.botAvatarCircular}
						onChange={(v) =>
							onChange({
								branding: { ...config.branding, botAvatarCircular: v },
							})
						}
					/>
					<div className="space-y-2">
						<Label>Avatar Type</Label>
						<div className="flex gap-4">
							<label className="flex items-center gap-2">
								<input
									type="radio"
									value="logo"
									checked={config.branding.botAvatarType === "logo"}
									onChange={() =>
										onChange({
											branding: { ...config.branding, botAvatarType: "logo" },
										})
									}
								/>
								<span className="text-sm">Logo</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									value="custom"
									checked={config.branding.botAvatarType === "custom"}
									onChange={() =>
										onChange({
											branding: { ...config.branding, botAvatarType: "custom" },
										})
									}
								/>
								<span className="text-sm">Custom</span>
							</label>
						</div>
					</div>
					{config.branding.botAvatarType === "custom" && (
						<FileDropzone
							onUpload={handleAvatarUpload}
							previewStorageId={config.branding.botAvatarStorageId}
							onRemove={() =>
								onChange({
									branding: {
										...config.branding,
										botAvatarStorageId: undefined,
									},
								})
							}
						/>
					)}
				</div>
			</FormSection>
		</div>
	);
}
