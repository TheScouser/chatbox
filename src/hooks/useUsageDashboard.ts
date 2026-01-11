import { useOrganization } from "@/contexts/OrganizationContext";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// Hook for usage overview data
export function useUsageOverview() {
	const { currentOrganization } = useOrganization();

	const data = useQuery(
		api.usageService.getUsageSummary,
		currentOrganization ? { organizationId: currentOrganization._id } : "skip",
	);

	return {
		data,
		loading: data === undefined,
		organizationName: currentOrganization?.name,
	};
}

// Hook for usage history with date range
export function useUsageHistory(
	startDate: string,
	endDate: string,
	agentId?: string,
) {
	const { currentOrganization } = useOrganization();

	const data = useQuery(
		api.usage.getUsageHistory,
		currentOrganization
			? {
					organizationId: currentOrganization._id,
					startDate,
					endDate,
					agentId: agentId as Id<"agents"> | undefined,
				}
			: "skip",
	);

	return {
		data,
		loading: data === undefined,
	};
}

// Hook for agent usage breakdown
export function useAgentUsageBreakdown(startDate: string, endDate: string) {
	const { currentOrganization } = useOrganization();

	const data = useQuery(
		api.usage.getAgentUsageBreakdown,
		currentOrganization
			? {
					organizationId: currentOrganization._id,
					startDate,
					endDate,
				}
			: "skip",
	);

	return {
		data,
		loading: data === undefined,
	};
}

// Hook for available agents for filtering
export function useOrganizationAgents() {
	const { currentOrganization } = useOrganization();

	const data = useQuery(
		api.usage.getOrganizationAgents,
		currentOrganization ? { organizationId: currentOrganization._id } : "skip",
	);

	return {
		agents: data || [],
		loading: data === undefined,
	};
}

// Hook for date range calculations
export function useDateRange(preset: "7d" | "30d" | "90d" | "custom" = "30d") {
	return useMemo(() => {
		const endDate = new Date();
		endDate.setHours(23, 59, 59, 999); // End of today

		const startDate = new Date(endDate);

		switch (preset) {
			case "7d":
				startDate.setDate(endDate.getDate() - 6); // Last 7 days including today
				break;
			case "30d":
				startDate.setDate(endDate.getDate() - 29); // Last 30 days including today
				break;
			case "90d":
				startDate.setDate(endDate.getDate() - 89); // Last 90 days including today
				break;
			default:
				// For custom, return current date for both (will be overridden)
				break;
		}

		startDate.setHours(0, 0, 0, 0); // Start of day

		return {
			startDate: startDate.toISOString().split("T")[0], // YYYY-MM-DD format
			endDate: endDate.toISOString().split("T")[0],
			label: getDateRangeLabel(startDate, endDate),
		};
	}, [preset]);
}

function getDateRangeLabel(startDate: Date, endDate: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		year:
			startDate.getFullYear() !== endDate.getFullYear() ? "numeric" : undefined,
	};

	const start = startDate.toLocaleDateString("en-US", options);
	const end = endDate.toLocaleDateString("en-US", options);

	return `${start} - ${end}`;
}

// Hook for combining usage overview with plan data
export function useUsageDashboardData() {
	const { currentOrganization } = useOrganization();

	// Get usage overview
	const usageOverview = useUsageOverview();

	// Get plan data (updated to pass organizationId)
	const plan = useQuery(
		api.billing.getUserPlan,
		currentOrganization ? { organizationId: currentOrganization._id } : "skip",
	);

	// Get subscription data
	const subscription = useQuery(
		api.billing.getUserSubscription,
		currentOrganization ? { organizationId: currentOrganization._id } : "skip",
	);

	return {
		usageOverview: usageOverview.data,
		plan,
		subscription,
		loading:
			usageOverview.loading || plan === undefined || subscription === undefined,
		organizationName: currentOrganization?.name,
	};
}
