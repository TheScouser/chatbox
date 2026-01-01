import { PlanCard } from "@/components/billing/PlanCard";
import { Button } from "@/components/ui/button";
import { useUserPlan } from "@/hooks/useFeatureAccess";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "../contexts/OrganizationContext";

export const Route = createFileRoute("/dashboard/billing/plans")({
	component: BillingPlans,
});

function BillingPlans() {
	const plans = useQuery(api.billing.getSubscriptionPlans, {});
	const { currentOrganization } = useOrganization();
	const { plan: currentPlan, isLoading: currentPlanLoading } = useUserPlan();
	const createCheckoutSession = useMutation(api.billing.createCheckoutSession);
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

	const handleSelectPlan = async (planId: string) => {
		setSelectedPlanId(planId);
		try {
			if (!currentOrganization?._id) return;

			const checkoutUrl = await createCheckoutSession({
				organizationId: currentOrganization._id,
				planId: planId as any,
				successUrl: `${window.location.origin}/dashboard/billing?success=true`,
				cancelUrl: `${window.location.origin}/dashboard/billing/plans?canceled=true`,
			});

			if (checkoutUrl) {
				window.location.href = checkoutUrl;
			}
		} catch (error) {
			console.error("Failed to create checkout session:", error);
			setSelectedPlanId(null);
		}
	};

	if (!plans || currentPlanLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link to="/dashboard/billing">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Billing
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-96 bg-gray-200 rounded-lg animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	// Define the static plans with their features
	const staticPlans = [
		{
			_id: "free",
			name: "Free",
			price: 0,
			features: {
				maxAgents: 1,
				maxKnowledgeEntries: 50,
				maxMessagesPerMonth: 500,
				maxFileUploads: 5,
				maxFileSizeMB: 2,
				prioritySupport: false,
				customDomains: false,
				advancedAnalytics: false,
				apiAccess: false,
				webhookIntegrations: false,
				customBranding: false,
				ssoIntegration: false,
				auditLogs: false,
			},
		},
		{
			_id: "starter",
			name: "Starter",
			price: 900, // $9 in cents
			features: {
				maxAgents: 3,
				maxKnowledgeEntries: 500,
				maxMessagesPerMonth: 5000,
				maxFileUploads: 50,
				maxFileSizeMB: 10,
				prioritySupport: false,
				customDomains: true,
				advancedAnalytics: false,
				apiAccess: false,
				webhookIntegrations: false,
				customBranding: false,
				ssoIntegration: false,
				auditLogs: false,
			},
		},
		{
			_id: "standard",
			name: "Standard",
			price: 2900, // $29 in cents
			features: {
				maxAgents: 10,
				maxKnowledgeEntries: 2000,
				maxMessagesPerMonth: 25000,
				maxFileUploads: 200,
				maxFileSizeMB: 25,
				prioritySupport: true,
				customDomains: true,
				advancedAnalytics: true,
				apiAccess: true,
				webhookIntegrations: true,
				customBranding: false,
				ssoIntegration: false,
				auditLogs: false,
			},
		},
		{
			_id: "pro",
			name: "Pro",
			price: 9900, // $99 in cents
			features: {
				maxAgents: 50,
				maxKnowledgeEntries: 10000,
				maxMessagesPerMonth: 100000,
				maxFileUploads: 1000,
				maxFileSizeMB: 100,
				prioritySupport: true,
				customDomains: true,
				advancedAnalytics: true,
				apiAccess: true,
				webhookIntegrations: true,
				customBranding: true,
				ssoIntegration: true,
				auditLogs: true,
			},
		},
	];

	return (
		<div className="space-y-8">
			<div className="flex items-center gap-4">
				<Link to="/dashboard/billing">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Billing
					</Button>
				</Link>
			</div>

			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold">Choose Your Plan</h1>
				<p className="text-xl text-gray-600">
					Select the perfect plan for your chatbot needs
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{staticPlans.map((plan, index) => (
					<PlanCard
						key={plan._id}
						name={plan.name}
						price={plan.price}
						features={plan.features}
						isCurrentPlan={currentPlan?.name === plan.name}
						isPopular={index === 2} // Standard plan is most popular
						onSelectPlan={
							plan.name === "Free"
								? undefined
								: () => handleSelectPlan(plan._id)
						}
						loading={selectedPlanId === plan._id}
					/>
				))}
			</div>

			<div className="text-center text-sm text-gray-500 space-y-2">
				<p>All plans include our core features and 24/7 support.</p>
				<p>
					You can upgrade, downgrade, or cancel your subscription at any time.
				</p>
			</div>
		</div>
	);
}
