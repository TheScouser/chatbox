import type * as React from "react";
import { cn } from "@/lib/utils";

interface TwoColumnLayoutProps {
	children: [React.ReactNode, React.ReactNode];
	className?: string;
}

export function TwoColumnLayout({ children, className }: TwoColumnLayoutProps) {
	const [left, right] = children;
	
	return (
		<div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", className)}>
			<div>{left}</div>
			<div>{right}</div>
		</div>
	);
}

interface PageLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
	return (
		<div className={cn("space-y-6", className)}>
			{children}
		</div>
	);
}

interface ThreeColumnGridProps {
	children: React.ReactNode;
	className?: string;
}

export function ThreeColumnGrid({ children, className }: ThreeColumnGridProps) {
	return (
		<div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
			{children}
		</div>
	);
}