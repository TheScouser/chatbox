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
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
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
		if (priceInCents === 0) return t("usage.free");
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
				usageSummary={usageOverview}
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
							<span>{t("usage.currentPlan", { planName })}</span>
							<Badge variant={isFree ? "secondary" : "default"}>
								{plan ? formatPrice(plan.price) : t("usage.free")}
							</Badge>
						</CardTitle>
						<CardDescription>
							{organizationName &&
								t("usage.organization", { orgName: organizationName })}
							{subscription && (
								<>
									{t("usage.billingPeriod", {
										start: new Date(
											subscription.currentPeriodStart,
										).toLocaleDateString(),
										end: new Date(
											subscription.currentPeriodEnd,
										).toLocaleDateString(),
									})}
								</>
							)}
							{isFree && t("usage.startWithFree")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className="text-sm text-gray-600">
									{t("usage.planLimits")}
								</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span className="font-medium">
											{(plan?.features.aiCredits || 100).toLocaleString()}
										</span>
										<span className="text-gray-500">
											{" "}
											{t("usage.aiCreditsMonth")}
										</span>
									</div>
									<div>
										<span className="font-medium">
											{(
												plan?.features.knowledgeCharacters || 500000
											).toLocaleString()}
										</span>
										<span className="text-gray-500">
											{" "}
											{t("usage.kbCharacters")}
										</span>
									</div>
									<div>
										<span className="font-medium">
											{plan?.features.maxChatbots || 2}
										</span>
										<span className="text-gray-500">
											{" "}
											{t("usage.chatbots")}
										</span>
									</div>
									<div>
										<span className="font-medium">
											{plan?.features.maxSeats || 1}
										</span>
										<span className="text-gray-500"> {t("usage.seats")}</span>
									</div>
								</div>
							</div>
							<Link to="/dashboard/settings/plans">
								<Button variant="outline" size="sm">
									<ArrowUpRight className="h-4 w-4 mr-1" />
									{isFree ? t("usage.upgradePlan") : t("usage.changePlan")}
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
						<CardTitle>{t("usage.usageInsights")}</CardTitle>
						<CardDescription>{t("usage.keyMetrics")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{usageHistory?.data && (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">{t("usage.dailyAverage")}</p>
										<p className="text-sm text-gray-600">
											{Math.round(
												usageHistory.data.reduce(
													(sum, d) => sum + d.creditsUsed,
													0,
												) / usageHistory.data.length || 0,
											)}{" "}
											{t("usage.creditsPerDay")}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">{t("usage.peakUsage")}</p>
										<p className="text-sm text-gray-600">
											{Math.max(
												...usageHistory.data.map((d) => d.creditsUsed),
												0,
											)}{" "}
											{t("usage.creditsInSingleDay")}
										</p>
									</div>
								</div>
								{agentBreakdown?.agents && agentBreakdown.agents.length > 1 && (
									<div className="flex items-start gap-3">
										<div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
										<div>
											<p className="font-medium">
												{t("usage.mostActiveAgent")}
											</p>
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
						<CardTitle>{t("usage.optimizationTips")}</CardTitle>
						<CardDescription>{t("usage.getMostOut")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isFree ? (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">
											{t("usage.maximizeFreeAgent")}
										</p>
										<p className="text-sm text-gray-600">
											{t("usage.maximizeFreeAgentDesc")}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">
											{t("usage.optimizeKnowledgeBase")}
										</p>
										<p className="text-sm text-gray-600">
											{t("usage.optimizeKnowledgeBaseDesc")}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">{t("usage.readyToScale")}</p>
										<p className="text-sm text-gray-600">
											{t("usage.readyToScaleDesc")}
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">{t("usage.distributeLoad")}</p>
										<p className="text-sm text-gray-600">
											{t("usage.distributeLoadDesc")}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
									<div>
										<p className="font-medium">
											{t("usage.monitorPerformance")}
										</p>
										<p className="text-sm text-gray-600">
											{t("usage.monitorPerformanceDesc")}
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
							{t("usage.approachingLimits")}
						</CardTitle>
						<CardDescription className="text-blue-700">
							{t("usage.approachingLimitsDesc")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/dashboard/settings/plans">
							<Button className="bg-blue-600 hover:bg-blue-700">
								{t("usage.viewPlansPricing")}
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
