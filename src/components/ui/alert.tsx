import type * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
	variant?: "default" | "destructive" | "success" | "warning";
	children: React.ReactNode;
	className?: string;
}

export function Alert({ variant = "default", children, className }: AlertProps) {
	const variants = {
		default: "bg-muted/50 border-border/30 text-foreground",
		destructive: "bg-destructive/10 border-destructive/20 text-destructive",
		success: "bg-success/10 border-success/20 text-success",
		warning: "bg-warning/10 border-warning/20 text-warning",
	};

	return (
		<div className={cn(
			"rounded-md border p-4",
			variants[variant],
			className
		)}>
			{children}
		</div>
	);
}

export function AlertDescription({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<p className={cn("text-sm", className)}>
			{children}
		</p>
	);
}