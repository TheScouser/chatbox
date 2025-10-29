import type * as React from "react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function ContentCard({ title, description, children, className }: ContentCardProps) {
	return (
		<div className={cn(
			"bg-card border border-border/60 shadow-sm rounded-lg hover:border-border/80 transition-all duration-200 ",
			className
		)}>
			<div className="p-6">
				<h3 className="text-lg font-medium text-card-foreground">{title}</h3>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}

export function ContentCardEmpty({
	icon: Icon,
	title,
	description,
	children,
	className
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("p-6 border-t border-border/30 text-center", className)}>
			<Icon className="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 className="mt-2 text-sm font-medium text-card-foreground">{title}</h3>
			<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			{children}
		</div>
	);
}

export function ContentCardList({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("border-t border-border/30", className)}>
			<div className="divide-y divide-border/30">
				{children}
			</div>
		</div>
	);
}

export function ContentCardListItem({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn(
			"p-6 hover:bg-muted/30 transition-colors duration-200",
			className
		)}>
			{children}
		</div>
	);
}