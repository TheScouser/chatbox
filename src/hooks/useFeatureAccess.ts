import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "../contexts/OrganizationContext";

// Valid feature types from convex/featureGates.ts
export type FeatureType =
	| "priority_support"
	| "custom_domains"
	| "advanced_analytics"
	| "api_access"
	| "webhook_integrations"
	| "custom_branding"
	| "sso_integration"
	| "audit_logs";

// Valid metric types from convex/featureGates.ts
export type MetricType =
	| "agents"
	| "messages"
	| "knowledge_entries"
	| "file_uploads";

export function useFeatureAccess(feature: FeatureType) {
	const { currentOrganization } = useOrganization();
	const access = useQuery(
		api.featureGates.checkFeatureAccess,
		currentOrganization?._id
			? {
					organizationId: currentOrganization._id,
					feature,
				}
			: "skip",
	);

	return {
		hasAccess: access?.hasAccess || false,
		loading: access === undefined,
		reason: access?.reason,
		currentPlan: access?.currentPlan,
		suggestedPlan: access?.suggestedPlan,
	};
}

export function useUsageLimit(metric: MetricType) {
	const { currentOrganization } = useOrganization();
	const limit = useQuery(
		api.featureGates.checkUsageLimit,
		currentOrganization?._id
			? {
					organizationId: currentOrganization._id,
					metric,
				}
			: "skip",
	);

	return {
		canPerformAction: limit?.allowed || false,
		usage: limit?.current || 0,
		limit: limit?.max || 0,
		percentUsed:
			limit && limit.current !== undefined && limit.max !== undefined
				? (limit.current / limit.max) * 100
				: 0,
		loading: limit === undefined,
		reason: limit?.reason,
	};
}

export function useUserPlan() {
	const plan = useQuery(api.billing.getUserPlan, {});

	return {
		plan,
		isLoading: plan === undefined,
		isFree: !plan || plan.name === "Free",
		planName: plan?.name || "Free",
		features: plan?.features,
	};
}

export function useUserSubscription() {
	const subscription = useQuery(api.billing.getUserSubscription, {});

	return {
		subscription,
		isLoading: subscription === undefined,
		hasSubscription: !!subscription,
		isActive: subscription?.status === "active",
		plan: subscription?.plan,
	};
}
