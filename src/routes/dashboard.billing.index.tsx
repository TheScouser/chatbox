import { UsageDashboard } from "@/components/billing/UsageProgress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUserPlan, useUserSubscription } from "@/hooks/useFeatureAccess";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CreditCard, Settings, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard/billing/")({
	component: BillingDashboard,
});

function BillingDashboard() {
	const { t } = useTranslation();
	const { plan, isLoading: planLoading, isFree, planName } = useUserPlan();
	const { subscription, isLoading: subLoading } = useUserSubscription();

	if (planLoading || subLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<div className="h-6 bg-gray-200 rounded animate-pulse" />
							</CardHeader>
							<CardContent>
								<div className="h-20 bg-gray-200 rounded animate-pulse" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const formatPrice = (priceInCents: number) => {
		if (priceInCents === 0) return t("billing.active");
		return `$${(priceInCents / 100).toFixed(0)}/month`;
	};

	const getStatusBadge = (status?: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-500">{t("billing.active")}</Badge>;
			case "canceled":
				return <Badge variant="destructive">{t("billing.canceled")}</Badge>;
			case "past_due":
				return <Badge variant="destructive">{t("billing.pastDue")}</Badge>;
			default:
				return <Badge variant="secondary">{t("usage.free")}</Badge>;
		}
	};

	return (
		<div className="space-y-8">
			{/* Current Plan Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Current Plan */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							{t("billing.currentPlan")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-2xl font-bold">{planName}</span>
								{getStatusBadge(subscription?.status)}
							</div>
							<p className="text-lg text-gray-600">
								{plan ? formatPrice(plan.price) : t("usage.free")}
							</p>
							{subscription && (
								<p className="text-sm text-gray-500">
									{t("billing.nextBilling", {
										date: new Date(
											subscription.currentPeriodEnd,
										).toLocaleDateString(),
									})}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							{t("billing.quickActions")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{isFree ? (
							<Link to="/dashboard/billing/plans">
								<Button className="w-full">{t("usage.upgradePlan")}</Button>
							</Link>
						) : (
							<div className="space-y-2">
								<Link to="/dashboard/billing/plans">
									<Button variant="outline" className="w-full">
										{t("usage.changePlan")}
									</Button>
								</Link>
								<Button variant="outline" className="w-full">
									{t("billing.quickActions")}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Usage Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							{t("billing.usageThisMonth")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>{t("billing.messages")}</span>
								<span className="font-medium">
									--- / {plan?.features.maxMessagesPerMonth || 500}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>{t("billing.fileUploads")}</span>
								<span className="font-medium">
									--- / {plan?.features.maxFileUploads || 5}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>{t("billing.agents")}</span>
								<span className="font-medium">
									--- / {plan?.features.maxAgents || 1}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Usage Dashboard */}
			<div>
				<h2 className="text-2xl font-bold mb-4">{t("billing.usageDetails")}</h2>
				<UsageDashboard />
			</div>

			{/* Upgrade CTA for Free Users */}
			{isFree && (
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader>
						<CardTitle className="text-blue-900">
							{t("billing.readyToScale")}
						</CardTitle>
						<CardDescription className="text-blue-700">
							{t("billing.readyToScaleDesc")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/dashboard/billing/plans">
							<Button className="bg-blue-600 hover:bg-blue-700">
								{t("billing.viewPlansPricing")}
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
