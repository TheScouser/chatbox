import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-muted",
				className
			)}
		/>
	);
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					className={cn(
						"h-4",
						i === lines - 1 ? "w-3/4" : "w-full"
					)}
				/>
			))}
		</div>
	);
}

/**
 * Skeleton for a card component
 */
export function SkeletonCard({ className }: SkeletonProps) {
	return (
		<div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
			<div className="flex items-center gap-4">
				<Skeleton className="h-12 w-12 rounded-lg" />
				<div className="space-y-2 flex-1">
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-3 w-1/3" />
				</div>
			</div>
			<SkeletonText lines={2} />
		</div>
	);
}

/**
 * Skeleton for a grid of cards (like the agents list)
 */
export function SkeletonCardGrid({
	count = 3,
	columns = 3,
	className,
}: {
	count?: number;
	columns?: number;
	className?: string;
}) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	}[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

	return (
		<div className={cn(`grid gap-6 ${gridCols}`, className)}>
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</div>
	);
}

/**
 * Skeleton for a table row
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
	return (
		<div className="flex items-center gap-4 py-4 border-b border-border/50">
			{Array.from({ length: columns }).map((_, i) => (
				<Skeleton
					key={i}
					className={cn(
						"h-4",
						i === 0 ? "w-[200px]" : "flex-1"
					)}
				/>
			))}
		</div>
	);
}

/**
 * Skeleton for a table
 */
export function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
	return (
		<div className={cn("rounded-xl border bg-card", className)}>
			{/* Header */}
			<div className="flex items-center gap-4 p-4 border-b border-border">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton
						key={i}
						className={cn(
							"h-4",
							i === 0 ? "w-[150px]" : "flex-1"
						)}
					/>
				))}
			</div>
			{/* Rows */}
			<div className="p-4 space-y-0">
				{Array.from({ length: rows }).map((_, i) => (
					<SkeletonTableRow key={i} columns={columns} />
				))}
			</div>
		</div>
	);
}

/**
 * Skeleton for a list item
 */
export function SkeletonListItem({ className }: SkeletonProps) {
	return (
		<div className={cn("flex items-center gap-4 p-4", className)}>
			<Skeleton className="h-10 w-10 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-1/3" />
				<Skeleton className="h-3 w-1/2" />
			</div>
			<Skeleton className="h-8 w-20" />
		</div>
	);
}

/**
 * Skeleton for a list
 */
export function SkeletonList({ count = 5, className }: { count?: number; className?: string }) {
	return (
		<div className={cn("rounded-xl border bg-card divide-y divide-border/50", className)}>
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonListItem key={i} />
			))}
		</div>
	);
}

/**
 * Skeleton for page header
 */
export function SkeletonPageHeader({ className }: SkeletonProps) {
	return (
		<div className={cn("space-y-2 mb-8", className)}>
			<Skeleton className="h-8 w-64" />
			<Skeleton className="h-4 w-96" />
		</div>
	);
}

/**
 * Skeleton for a stat card / metric
 */
export function SkeletonStatCard({ className }: SkeletonProps) {
	return (
		<div className={cn("rounded-xl border bg-card p-6", className)}>
			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-8 w-8 rounded-lg" />
			</div>
			<Skeleton className="h-8 w-20 mb-2" />
			<Skeleton className="h-3 w-16" />
		</div>
	);
}

/**
 * Skeleton for a row of stat cards
 */
export function SkeletonStatCards({ count = 4, className }: { count?: number; className?: string }) {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonStatCard key={i} />
			))}
		</div>
	);
}

/**
 * Skeleton for a chart
 */
export function SkeletonChart({ className }: SkeletonProps) {
	return (
		<div className={cn("rounded-xl border bg-card p-6", className)}>
			<div className="space-y-2 mb-6">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-48" />
			</div>
			<Skeleton className="h-[200px] w-full rounded-lg" />
		</div>
	);
}

/**
 * Skeleton for form fields
 */
export function SkeletonForm({ fields = 3, className }: { fields?: number; className?: string }) {
	return (
		<div className={cn("rounded-xl border bg-card p-6 space-y-6", className)}>
			<div className="space-y-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-64" />
			</div>
			<div className="space-y-4">
				{Array.from({ length: fields }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-10 w-full rounded-md" />
					</div>
				))}
			</div>
			<div className="flex justify-end gap-3 pt-4">
				<Skeleton className="h-10 w-24 rounded-md" />
				<Skeleton className="h-10 w-24 rounded-md" />
			</div>
		</div>
	);
}

/**
 * Full page loading skeleton
 */
export function SkeletonPage({ className }: SkeletonProps) {
	return (
		<div className={cn("space-y-8", className)}>
			<SkeletonPageHeader />
			<SkeletonStatCards count={4} />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<SkeletonChart />
				<SkeletonChart />
			</div>
		</div>
	);
}

/**
 * Inline loading indicator for buttons and small areas
 */
export function LoadingSpinner({ className, size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<svg
			className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}

/**
 * Full-page loading state
 */
export function PageLoading({ message = "Loading..." }: { message?: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
			<LoadingSpinner size="lg" className="text-primary" />
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}
