import { cn } from "@/lib/utils";
import type * as React from "react";

interface FormCardProps {
	title: string;
	description?: string;
	icon?: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
	className?: string;
}

export function FormCard({
	title,
	description,
	icon: Icon,
	children,
	className,
}: FormCardProps) {
	return (
		<div
			className={cn(
				"bg-card border border-border/60 shadow-sm rounded-lg hover:border-border/80 transition-all duration-200",
				className,
			)}
		>
			<div className="p-6">
				<h3 className="text-lg font-medium text-card-foreground flex items-center">
					{Icon && <Icon className="h-5 w-5 mr-2 text-primary" />}
					{title}
				</h3>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			<div className="px-6 pb-6 border-t border-border/30">{children}</div>
		</div>
	);
}

export function FormSection({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return <div className={cn("space-y-6 pt-6", className)}>{children}</div>;
}

export function FormField({
	label,
	required,
	error,
	hint,
	children,
	className,
}: {
	label: string;
	required?: boolean;
	error?: string;
	hint?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex justify-between items-baseline">
				<label className="block text-sm font-medium text-card-foreground">
					{label}
					{required && <span className="text-destructive ml-1">*</span>}
				</label>
				{hint && !error && (
					<span className="text-xs text-muted-foreground">{hint}</span>
				)}
			</div>
			{children}
			{error && <p className="text-sm text-destructive mt-1">{error}</p>}
		</div>
	);
}

export function FormActions({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"flex items-center justify-end space-x-3 pt-6 border-t border-border/30",
				className,
			)}
		>
			{children}
		</div>
	);
}
