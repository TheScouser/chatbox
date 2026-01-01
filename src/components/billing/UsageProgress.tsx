import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsageLimit } from "@/hooks/useFeatureAccess";
import { AlertTriangle } from "lucide-react";

interface UsageProgressProps {
	metric: string;
	title: string;
	description?: string;
}

export function UsageProgress({
	metric,
	title,
	description,
}: UsageProgressProps) {
	const { usage, limit, percentUsed, loading, canPerformAction } =
		useUsageLimit(metric);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-4 bg-gray-200 rounded animate-pulse" />
				</CardContent>
			</Card>
		);
	}

	const getStatusColor = (percent: number) => {
		if (percent >= 90) return "bg-red-500";
		if (percent >= 75) return "bg-yellow-500";
		return "bg-blue-500";
	};

	const getStatusBadge = (percent: number) => {
		if (percent >= 100)
			return <Badge variant="destructive">Limit Reached</Badge>;
		if (percent >= 90) return <Badge variant="destructive">Critical</Badge>;
		if (percent >= 75) return <Badge className="bg-yellow-500">Warning</Badge>;
		return <Badge variant="secondary">Normal</Badge>;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">{title}</CardTitle>
					{getStatusBadge(percentUsed)}
				</div>
				{description && <p className="text-sm text-gray-500">{description}</p>}
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-sm">
					<span>{usage.toLocaleString()} used</span>
					<span>{limit.toLocaleString()} limit</span>
				</div>

				<Progress
					value={percentUsed}
					className="h-3"
					// @ts-ignore - Progress component accepts custom background color
					style={{ "--progress-background": getStatusColor(percentUsed) }}
				/>

				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>{percentUsed.toFixed(1)}% used</span>
					{percentUsed >= 80 && (
						<div className="flex items-center gap-1 text-yellow-600">
							<AlertTriangle className="h-3 w-3" />
							<span>Approaching limit</span>
						</div>
					)}
				</div>

				{!canPerformAction && (
					<div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
						<AlertTriangle className="h-4 w-4" />
						<span>Limit exceeded. Upgrade your plan to continue.</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function UsageDashboard() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<UsageProgress
				metric="agents"
				title="Agents"
				description="Active chatbot agents"
			/>
			<UsageProgress
				metric="messages"
				title="Messages"
				description="This month"
			/>
			<UsageProgress
				metric="knowledge_entries"
				title="Knowledge Entries"
				description="Total knowledge base size"
			/>
			<UsageProgress
				metric="file_uploads"
				title="File Uploads"
				description="This month"
			/>
		</div>
	);
}
