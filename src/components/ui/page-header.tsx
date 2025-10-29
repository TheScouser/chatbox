import type * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">{title}</h1>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}

interface PageSectionProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function PageSection({ title, description, children, className }: PageSectionProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{(title || description) && (
				<div>
					{title && (
						<h3 className="text-lg font-medium text-card-foreground">{title}</h3>
					)}
					{description && (
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			{children}
		</div>
	);
}