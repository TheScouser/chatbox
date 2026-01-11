import { cn } from "@/lib/utils";
import type * as React from "react";
import { Button } from "./button";

interface EntryItemProps {
	title: string;
	content?: string;
	metadata?: React.ReactNode;
	onEdit?: () => void;
	onDelete?: () => void;
	className?: string;
	maxContentLength?: number;
}

export function EntryItem({
	title,
	content,
	metadata,
	onEdit,
	onDelete,
	className,
	maxContentLength = 150,
}: EntryItemProps) {
	const displayContent =
		content && content.length > maxContentLength
			? `${content.substring(0, maxContentLength)}...`
			: content;

	return (
		<div className={cn("flex items-start justify-between", className)}>
			<div className="flex-1">
				<h4 className="text-sm font-medium text-card-foreground">{title}</h4>
				{content && (
					<div className="mt-2 text-sm text-muted-foreground prose prose-sm max-w-none">
						{typeof content === "string" && content.includes("<") ? (
							// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML content from knowledge entries, should be sanitized server-side
							<div dangerouslySetInnerHTML={{ __html: displayContent || "" }} />
						) : (
							<p>{displayContent}</p>
						)}
					</div>
				)}
				{metadata && (
					<div className="mt-2 text-xs text-muted-foreground/80">
						{metadata}
					</div>
				)}
			</div>
			<div className="flex items-center space-x-2 ml-4">
				{onEdit && (
					<Button size="sm" variant="outline" onClick={onEdit}>
						Edit
					</Button>
				)}
				{onDelete && (
					<Button
						size="sm"
						variant="outline"
						onClick={onDelete}
						className="text-destructive hover:text-destructive/80 border-destructive/20 hover:border-destructive/30"
					>
						Delete
					</Button>
				)}
			</div>
		</div>
	);
}
