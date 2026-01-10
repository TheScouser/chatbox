import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	SkeletonChart,
	SkeletonPageHeader,
	SkeletonStatCards,
} from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useState } from "react";

import { AgentUsageChart } from "@/components/usage/AgentUsageChart";
import { UsageFilters } from "@/components/usage/UsageFilters";
import { UsageHistoryChart } from "@/components/usage/UsageHistoryChart";
// Import our new usage dashboard components
import { UsageOverviewCards } from "@/components/usage/UsageOverviewCards";

// Import our new hooks
import {
	useAgentUsageBreakdown,
	useDateRange,
	useUsageDashboardData,
	useUsageHistory,
} from "@/hooks/useUsageDashboard";

export const Route = createFileRoute("/dashboard/usage")({
	component: UsagePage,
});

function UsagePage() {
	// State for filters
	const [selectedDateRange, setSelectedDateRange] = useState<
		"7d" | "30d" | "90d"
	>("30d");
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

	// Get date range for queries
	const dateRange = useDateRange(selectedDateRange);

	// Get dashboard data
	const {
		usageOverview,
		plan,
		subscription,
		loading: dashboardLoading,
		organizationName,
	} = useUsageDashboardData();

	// Get historical usage data
	const { data: usageHistory, loading: historyLoading } = useUsageHistory(
		dateRange.startDate,
		dateRange.endDate,
		selectedAgentId || undefined,
	);

	// Get agent usage breakdown
	const { data: agentBreakdown, loading: agentLoading } =
		useAgentUsageBreakdown(dateRange.startDate, dateRange.endDate);

	const isFree = !plan || plan.name === "Free";
	const planName = plan?.name || "Free";

	const formatPrice = (priceInCents: number) => {
		if (priceInCents === 0) return "Free";
		return `$${(priceInCents / 100).toFixed(0)}/month`;
	};

	// Loading state
	if (dashboardLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<SkeletonPageHeader />
				<SkeletonStatCards count={4} className="mb-8" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<SkeletonChart />
					<SkeletonChart />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Usage Filters */}
			<UsageFilters
				selectedDateRange={selectedDateRange}
				selectedAgentId={selectedAgentId}
				onDateRangeChange={setSelectedDateRange}
				onAgentChange={setSelectedAgentId}
			/>

			{/* Usage Overview Cards */}
			<UsageOverviewCards
				creditsUsed={usageOverview?.creditsUsed || 0}
				creditsLimit={usageOverview?.creditsLimit || 500}
				agentsUsed={usageOverview?.agentsUsed || 0}
				agentsLimit={usageOverview?.agentsLimit || 1}
				loading={dashboardLoading}
			/>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Usage History Chart */}
				<UsageHistoryChart
					data={usageHistory?.data || []}
					loading={historyLoading}
				/>

				{/* Agent Usage Breakdown Chart */}
				<AgentUsageChart
					agents={agentBreakdown?.agents || []}
					totalCredits={agentBreakdown?.totalCredits || 0}
					loading={agentLoading}
				/>
			</div>

			{/* Current Plan Info */}
			<div className="mb-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Current Plan: {planName}</span>
							<Badge variant={isFree ? "secondary" : "default"}>
								{plan ? formatPrice(plan.price) : "Free"}
							</Badge>
						</CardTitle>
						<CardDescription>
							{organizationName && `Organization: ${organizationName} • `}
							{subscription && (
								<>
									Billing period:{" "}
									{new Date(
										subscription.currentPeriodStart,
									).toLocaleDateString()}{" "}
									-{" "}
									{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
								</>
							)}
							{isFree &&
								"Start with our free plan and upgrade when you're ready to scale"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className="text-sm text-gray-600">Plan Limits</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span className="font-medium">
											{plan?.features.maxAgents || 1}
										</span>
										<span className="text-gray-500"> agents</span>
									</div>
									<div>
										<span className="font-medium">
											{(
												plan?.features.maxMessagesPerMonth || 500
											).toLocaleString()}
										</span>
										<span className="text-gray-500"> messages/month</span>
									</div>
									<div>
										<span className="font-medium">
											{(
												plan?.features.maxKnowledgeEntries || 50
											).toLocaleString()}
										</span>
										<span className="text-gray-500"> knowledge entries</span>
									</div>
									<div>
										<span className="font-medium">
											{plan?.features.maxFileSizeMB || 2}
										</span>
										<span className="text-gray-500">MB max file size</span>
									</div>
								</div>
							</div>
							<Link to="/dashboard/settings/plans">
								<Button variant="outline" size="sm">
									<ArrowUpRight className="h-4 w-4 mr-1" />
									{isFree ? "Upgrade Plan" : "Change Plan"}
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Usage Insights */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Usage Insights</CardTitle>
						<CardDescription>Key metrics and trends</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{usageHistory?.data && (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Daily Average</p>
										<p className="text-sm text-gray-600">
											{Math.round(
												usageHistory.data.reduce(
													(sum, d) => sum + d.creditsUsed,
													0,
												) / usageHistory.data.length || 0,
											)}{" "}
											credits per day
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Peak Usage</p>
										<p className="text-sm text-gray-600">
											{Math.max(
												...usageHistory.data.map((d) => d.creditsUsed),
												0,
											)}{" "}
											credits in a single day
										</p>
									</div>
								</div>
								{agentBreakdown?.agents && agentBreakdown.agents.length > 1 && (
									<div className="flex items-start gap-3">
										<div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
										<div>
											<p className="font-medium">Most Active Agent</p>
											<p className="text-sm text-gray-600">
												{agentBreakdown.agents[0]?.agentName || "N/A"}
											</p>
										</div>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Optimization Tips</CardTitle>
						<CardDescription>
							Get the most out of your current plan
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isFree ? (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Maximize your free agent</p>
										<p className="text-sm text-gray-600">
											Upload diverse knowledge sources to make your agent more
											capable
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Optimize your knowledge base</p>
										<p className="text-sm text-gray-600">
											Keep your content focused and relevant for better
											responses
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Ready to scale?</p>
										<p className="text-sm text-gray-600">
											Upgrade to create multiple specialized agents
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Distribute your load</p>
										<p className="text-sm text-gray-600">
											Create specialized agents for different use cases
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">Monitor performance</p>
										<p className="text-sm text-gray-600">
											Use this dashboard to understand which agents are most
											effective
										</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Upgrade CTA for Free Users */}
			{isFree && (
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader>
						<CardTitle className="text-blue-900 flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Approaching your limits?
						</CardTitle>
						<CardDescription className="text-blue-700">
							Upgrade to unlock more capacity and premium features for your
							growing needs.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/dashboard/settings/plans">
							<Button className="bg-blue-600 hover:bg-blue-700">
								View Plans & Pricing
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
