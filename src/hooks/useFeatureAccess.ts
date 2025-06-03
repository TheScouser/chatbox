import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useFeatureAccess(feature: string) {
  const access = useQuery(api.featureGates.checkFeatureAccess, { 
    feature: feature as any 
  });
  
  return {
    hasAccess: access?.hasAccess || false,
    loading: access === undefined,
    reason: access?.reason,
    currentPlan: access?.currentPlan,
    suggestedPlan: access?.suggestedPlan,
  };
}

export function useUsageLimit(metric: string) {
  const limit = useQuery(api.featureGates.checkUsageLimit, { 
    metric: metric as any 
  });
  
  return {
    canPerformAction: limit?.allowed || false,
    usage: limit?.current || 0,
    limit: limit?.max || 0,
    percentUsed: limit && limit.current !== undefined && limit.max !== undefined 
      ? (limit.current / limit.max) * 100 
      : 0,
    loading: limit === undefined,
    reason: limit?.reason
  };
}

export function useUserPlan() {
  const plan = useQuery(api.billing.getUserPlan, {});
  
  return {
    plan,
    isLoading: plan === undefined,
    isFree: !plan || plan.name === "Free",
    planName: plan?.name || "Free",
    features: plan?.features
  };
}

export function useUserSubscription() {
  const subscription = useQuery(api.billing.getUserSubscription, {});
  
  return {
    subscription,
    isLoading: subscription === undefined,
    hasSubscription: !!subscription,
    isActive: subscription?.status === "active",
    plan: subscription?.plan
  };
} 