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
	success,
	children,
	className,
	id,
}: {
	label: string;
	required?: boolean;
	error?: string;
	hint?: string;
	success?: string;
	children: React.ReactNode;
	className?: string;
	id?: string;
}) {
	const hasError = Boolean(error);
	const hasSuccess = Boolean(success) && !hasError;

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex justify-between items-baseline">
				<label
					htmlFor={id}
					className="block text-sm font-medium text-card-foreground"
				>
					{label}
					{required && <span className="text-destructive ml-1">*</span>}
				</label>
				{hint && !error && !success && (
					<span className="text-xs text-muted-foreground">{hint}</span>
				)}
			</div>
			{children}
			{hasError && (
				<p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
					<svg
						className="h-4 w-4 flex-shrink-0"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
					{error}
				</p>
			)}
			{hasSuccess && (
				<p className="text-sm text-green-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
					<svg
						className="h-4 w-4 flex-shrink-0"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
					{success}
				</p>
			)}
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
