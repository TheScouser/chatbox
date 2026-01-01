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
import { Calendar, CreditCard, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings/billing")({
	component: BillingSettings,
});

function BillingSettings() {
	const { plan, isLoading: planLoading, isFree, planName } = useUserPlan();
	const { subscription, isLoading: subLoading } = useUserSubscription();

	if (planLoading || subLoading) {
		return (
			<div className="space-y-6">
				<div className="h-8 bg-gray-200 rounded animate-pulse" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	const formatPrice = (priceInCents: number) => {
		if (priceInCents === 0) return "Free";
		return `$${(priceInCents / 100).toFixed(0)}/month`;
	};

	const getStatusBadge = (status?: string) => {
		switch (status) {
			case "active":
				return <Badge className="bg-green-500">Active</Badge>;
			case "canceled":
				return <Badge variant="destructive">Canceled</Badge>;
			case "past_due":
				return <Badge variant="destructive">Past Due</Badge>;
			default:
				return <Badge variant="secondary">Free</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
				<p className="text-gray-600">
					Manage your subscription and billing information
				</p>
			</div>

			{/* Current Subscription */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Current Subscription
					</CardTitle>
					<CardDescription>
						Your active plan and billing details
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">{planName}</h3>
							<p className="text-gray-600">
								{plan ? formatPrice(plan.price) : "Free"}
							</p>
						</div>
						{getStatusBadge(subscription?.status)}
					</div>

					{subscription && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-600">Billing Period</p>
								<p className="font-medium">
									{new Date(
										subscription.currentPeriodStart,
									).toLocaleDateString()}{" "}
									-{" "}
									{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-gray-600">Next Billing Date</p>
								<p className="font-medium">
									{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
								</p>
							</div>
						</div>
					)}

					<div className="flex gap-2 pt-4">
						{isFree ? (
							<Link to="/dashboard/settings/plans">
								<Button>Upgrade Plan</Button>
							</Link>
						) : (
							<>
								<Link to="/dashboard/settings/plans">
									<Button variant="outline">Change Plan</Button>
								</Link>
								<Button variant="outline">
									<ExternalLink className="h-4 w-4 mr-2" />
									Manage Billing
								</Button>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Billing History */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Billing History
					</CardTitle>
					<CardDescription>
						View and download your past invoices
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isFree ? (
						<div className="text-center py-8 text-gray-500">
							<Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
							<p>No billing history yet</p>
							<p className="text-sm">
								Upgrade to a paid plan to see your invoices here
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{/* Placeholder for billing history */}
							<div className="text-center py-8 text-gray-500">
								<Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
								<p>Billing history will appear here</p>
								<p className="text-sm">
									Your invoices and payment history will be displayed once
									available
								</p>
							</div>

							{/* Future billing history items would go here */}
							{/* Example structure:
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Pro Plan - March 2024</p>
                  <p className="text-sm text-gray-600">March 1, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Paid</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              */}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Payment Method */}
			<Card>
				<CardHeader>
					<CardTitle>Payment Method</CardTitle>
					<CardDescription>Manage your default payment method</CardDescription>
				</CardHeader>
				<CardContent>
					{isFree ? (
						<div className="text-center py-6 text-gray-500">
							<CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
							<p>No payment method required</p>
							<p className="text-sm">You're currently on the free plan</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="text-center py-6 text-gray-500">
								<CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
								<p>Payment method management</p>
								<p className="text-sm">
									Use the "Manage Billing" button above to update your payment
									method
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
