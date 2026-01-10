import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface UsageMetric {
	current: number;
	limit: number;
	percentUsed: number;
}

interface UsageOverviewCardsProps {
	usageSummary?: {
		aiCredits: UsageMetric;
		knowledgeCharacters: UsageMetric;
		emailCredits: UsageMetric;
		chatbots: UsageMetric;
		seats: UsageMetric;
	};
	loading?: boolean;
}

export function UsageOverviewCards({
	usageSummary,
	loading = false,
}: UsageOverviewCardsProps) {
	if (loading || !usageSummary) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="h-32 bg-gray-200 rounded animate-pulse" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	const getStatusColor = (percentUsed: number): string => {
		if (percentUsed >= 90) return "bg-red-500";
		if (percentUsed >= 75) return "bg-orange-500";
		if (percentUsed >= 50) return "bg-yellow-500";
		return "bg-green-500";
	};

	const getStatusBadge = (percentUsed: number) => {
		if (percentUsed >= 100)
			return { variant: "destructive" as const, text: "Limit Reached" };
		if (percentUsed >= 90)
			return { variant: "destructive" as const, text: "Critical" };
		if (percentUsed >= 75)
			return { variant: "secondary" as const, text: "Warning" };
		return { variant: "secondary" as const, text: "Normal" };
	};

	const formatNumber = (num: number): string => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toLocaleString();
	};

	const UsageCard = ({
		title,
		current,
		limit,
		percentUsed,
		unit,
		showUpgrade = false,
	}: {
		title: string;
		current: number;
		limit: number;
		percentUsed: number;
		unit: string;
		showUpgrade?: boolean;
	}) => {
		const status = getStatusBadge(percentUsed);
		const color = getStatusColor(percentUsed);

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-semibold flex items-center justify-between">
						<span>{title}</span>
						<Badge variant={status.variant} className="text-xs">
							{status.text}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-2">
						<div className="flex items-baseline justify-between">
							<span className="text-2xl font-bold text-gray-900">
								{formatNumber(current)}
							</span>
							<span className="text-sm text-gray-500">
								of {formatNumber(limit)} {unit}
							</span>
						</div>
						<div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
							<div
								className={`h-full transition-all ${color}`}
								style={{ width: `${Math.min(percentUsed, 100)}%` }}
							/>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-gray-600">
								{percentUsed.toFixed(1)}% used
							</span>
							{percentUsed >= 75 && (
								<div className="flex items-center gap-1 text-orange-600">
									<AlertTriangle className="h-3 w-3" />
									<span>High usage</span>
								</div>
							)}
						</div>
					</div>
					{showUpgrade && percentUsed >= 90 && (
						<Link to="/dashboard/settings/plans">
							<Button variant="outline" size="sm" className="w-full">
								<ArrowUpRight className="h-3 w-3 mr-1" />
								Upgrade Plan
							</Button>
						</Link>
					)}
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			<UsageCard
				title="AI Credits"
				current={usageSummary.aiCredits.current}
				limit={usageSummary.aiCredits.limit}
				percentUsed={usageSummary.aiCredits.percentUsed}
				unit="credits"
				showUpgrade={true}
			/>
			<UsageCard
				title="Knowledge Base"
				current={usageSummary.knowledgeCharacters.current}
				limit={usageSummary.knowledgeCharacters.limit}
				percentUsed={usageSummary.knowledgeCharacters.percentUsed}
				unit="characters"
				showUpgrade={true}
			/>
			<UsageCard
				title="Email Credits"
				current={usageSummary.emailCredits.current}
				limit={usageSummary.emailCredits.limit}
				percentUsed={usageSummary.emailCredits.percentUsed}
				unit="credits"
				showUpgrade={true}
			/>
			<UsageCard
				title="Chatbots"
				current={usageSummary.chatbots.current}
				limit={usageSummary.chatbots.limit}
				percentUsed={usageSummary.chatbots.percentUsed}
				unit="chatbots"
				showUpgrade={true}
			/>
			<UsageCard
				title="Seats"
				current={usageSummary.seats.current}
				limit={usageSummary.seats.limit}
				percentUsed={usageSummary.seats.percentUsed}
				unit="seats"
				showUpgrade={true}
			/>
		</div>
	);
}
