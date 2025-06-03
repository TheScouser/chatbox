import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Check if user has access to a specific feature (updated for organizations)
export const checkFeatureAccess = query({
  args: { 
    organizationId: v.id("organizations"),
    feature: v.union(
      v.literal("priority_support"),
      v.literal("custom_domains"),
      v.literal("advanced_analytics"),
      v.literal("api_access"),
      v.literal("webhook_integrations"),
      v.literal("custom_branding"),
      v.literal("sso_integration"),
      v.literal("audit_logs")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return { hasAccess: false, reason: "not_authenticated" };
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { hasAccess: false, reason: "user_not_found" };
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      return { hasAccess: false, reason: "no_organization_access" };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      // Free plan access
      return { 
        hasAccess: false, 
        reason: "upgrade_required", 
        suggestedPlan: "starter",
        currentPlan: "free"
      };
    }
    
    const plan = await ctx.db.get(subscription.planId);
    if (!plan) {
      return { hasAccess: false, reason: "plan_not_found" };
    }

    const featureMap: Record<string, keyof typeof plan.features> = {
      "priority_support": "prioritySupport",
      "custom_domains": "customDomains", 
      "advanced_analytics": "advancedAnalytics",
      "api_access": "apiAccess",
      "webhook_integrations": "webhookIntegrations",
      "custom_branding": "customBranding",
      "sso_integration": "ssoIntegration",
      "audit_logs": "auditLogs"
    };

    const featureKey = featureMap[args.feature];
    const hasAccess = plan.features[featureKey] || false;
    
    return {
      hasAccess,
      reason: hasAccess ? "granted" : "upgrade_required",
      currentPlan: plan.name,
      suggestedPlan: hasAccess ? null : getSuggestedUpgrade(args.feature)
    };
  }
});

// Check usage limits for a specific metric (updated for organizations)
export const checkUsageLimit = query({
  args: {
    organizationId: v.id("organizations"),
    metric: v.union(
      v.literal("agents"),
      v.literal("messages"),
      v.literal("knowledge_entries"),
      v.literal("file_uploads")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return { allowed: false, reason: "not_authenticated" };
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { allowed: false, reason: "user_not_found" };
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      return { allowed: false, reason: "no_organization_access" };
    }

    // Get current plan limits
    let planLimits;
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (subscription) {
      const plan = await ctx.db.get(subscription.planId);
      planLimits = plan?.features;
    } else {
      // Free plan limits
      planLimits = {
        maxAgents: 1,
        maxKnowledgeEntries: 50,
        maxMessagesPerMonth: 500,
        maxFileUploads: 5,
        maxFileSizeMB: 2,
      };
    }

    if (!planLimits) {
      return { allowed: false, reason: "plan_not_found" };
    }

    // Get current usage
    const currentUsage = await getCurrentUsage(ctx, args.organizationId, args.metric);
    
    const limitMap: Record<string, keyof typeof planLimits> = {
      "agents": "maxAgents",
      "messages": "maxMessagesPerMonth",
      "knowledge_entries": "maxKnowledgeEntries", 
      "file_uploads": "maxFileUploads"
    };

    const limitKey = limitMap[args.metric];
    const limit = planLimits[limitKey] as number;
    const allowed = currentUsage < limit;
    
    return {
      allowed,
      current: currentUsage,
      max: limit,
      percentUsed: (currentUsage / limit) * 100,
      reason: allowed ? "within_limit" : "limit_exceeded"
    };
  }
});

// Track usage for billing (updated for organizations)
export const trackUsage = mutation({
  args: {
    organizationId: v.id("organizations"),
    metric: v.union(
      v.literal("messages"),
      v.literal("agents"),
      v.literal("knowledge_entries"),
      v.literal("file_uploads"),
      v.literal("storage_mb"),
      v.literal("api_calls")
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("No access to this organization");
    }

    const currentPeriod = getCurrentPeriod();
    
    // Get or create usage record for current period
    const existingUsage = await ctx.db
      .query("billingUsage")
      .withIndex("organizationId_period", (q) => q.eq("organizationId", args.organizationId).eq("period", currentPeriod))
      .first();

    const metricMap: Record<string, string> = {
      "messages": "messagesUsed",
      "agents": "agentsCreated",
      "knowledge_entries": "knowledgeEntriesAdded",
      "file_uploads": "filesUploaded", 
      "storage_mb": "storageUsedMB",
      "api_calls": "apiCallsMade"
    };

    const metricKey = metricMap[args.metric];

    if (existingUsage) {
      // Update existing usage record
      const currentMetrics = existingUsage.metrics;
      const updatedMetrics = {
        ...currentMetrics,
        [metricKey]: (currentMetrics[metricKey as keyof typeof currentMetrics] as number) + args.amount
      };

      await ctx.db.patch(existingUsage._id, {
        metrics: updatedMetrics,
        lastUpdated: Date.now()
      });
    } else {
      // Create new usage record
      const initialMetrics = {
        messagesUsed: 0,
        agentsCreated: 0,
        knowledgeEntriesAdded: 0,
        filesUploaded: 0,
        storageUsedMB: 0,
        apiCallsMade: 0,
        [metricKey]: args.amount
      };

      await ctx.db.insert("billingUsage", {
        organizationId: args.organizationId,
        period: currentPeriod,
        metrics: initialMetrics,
        lastUpdated: Date.now()
      });
    }

    // Check if usage alert should be sent
    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await checkAndSendUsageAlert(ctx, args.organizationId, args.metric, 
        existingUsage ? existingUsage.metrics[metricKey as keyof typeof existingUsage.metrics] + args.amount : args.amount);
    }

    return { success: true };
  },
});

// Helper function to get current usage (updated for organizations)
async function getCurrentUsage(ctx: any, organizationId: string, metric: string): Promise<number> {
  const currentPeriod = getCurrentPeriod();
  
  if (metric === "agents") {
    // Count current agents for organization
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", organizationId))
      .collect();
    return agents.length;
  }
  
  // For other metrics, get from billing usage
  const usage = await ctx.db
    .query("billingUsage")
    .withIndex("organizationId_period", (q: any) => q.eq("organizationId", organizationId).eq("period", currentPeriod))
    .first();
  
  if (!usage) return 0;
  
  const metricMap: Record<string, keyof typeof usage.metrics> = {
    "messages": "messagesUsed",
    "knowledge_entries": "knowledgeEntriesAdded",
    "file_uploads": "filesUploaded"
  };
  
  const metricKey = metricMap[metric];
  return usage.metrics[metricKey] as number || 0;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getSuggestedUpgrade(feature: string): string {
  const upgradeMap: Record<string, string> = {
    "priority_support": "pro",
    "custom_domains": "pro", 
    "advanced_analytics": "pro",
    "api_access": "pro",
    "webhook_integrations": "enterprise",
    "custom_branding": "enterprise",
    "sso_integration": "enterprise",
    "audit_logs": "enterprise"
  };
  
  return upgradeMap[feature] || "pro";
}

// Updated to work with organizations
async function checkAndSendUsageAlert(ctx: any, organizationId: string, metric: string, currentUsage: number) {
  // Get organization's plan limits
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("organizationId", (q: any) => q.eq("organizationId", organizationId))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .first();

  let limit: number;
  let planName: string;
  
  if (subscription) {
    const plan = await ctx.db.get(subscription.planId);
    if (!plan) return;
    
    planName = plan.name;
    const limitMap: Record<string, keyof typeof plan.features> = {
      "messages": "maxMessagesPerMonth",
      "agents": "maxAgents", 
      "knowledge_entries": "maxKnowledgeEntries",
      "file_uploads": "maxFileUploads"
    };
    
    const limitKey = limitMap[metric];
    limit = plan.features[limitKey] as number;
  } else {
    // Free plan
    planName = "Free";
    const freeLimits: Record<string, number> = {
      "messages": 500,
      "agents": 1,
      "knowledge_entries": 50,
      "file_uploads": 5
    };
    limit = freeLimits[metric] || 0;
  }
  
  const percentUsed = (currentUsage / limit) * 100;
  
  // Send alert if at 75% or 90% usage
  if (percentUsed >= 75 && percentUsed < 90) {
    await sendUsageAlert(ctx, organizationId, metric, currentUsage, limit, percentUsed, planName, "warning");
  } else if (percentUsed >= 90) {
    await sendUsageAlert(ctx, organizationId, metric, currentUsage, limit, percentUsed, planName, "critical");
  }
}

async function sendUsageAlert(ctx: any, organizationId: string, metric: string, currentUsage: number, limit: number, percentUsed: number, planName: string, severity: string) {
  // Get organization owners and admins to send alerts to
  const memberships = await ctx.db
    .query("organizationMembers")
    .withIndex("organizationId", (q: any) => q.eq("organizationId", organizationId))
    .filter((q: any) => 
      q.and(
        q.eq(q.field("status"), "active"),
        q.or(
          q.eq(q.field("role"), "owner"),
          q.eq(q.field("role"), "admin")
        )
      )
    )
    .collect();

  // Send alert to each admin/owner
  for (const membership of memberships) {
    const user = await ctx.db.get(membership.userId);
    if (user && user.email && user.name) {
      await ctx.scheduler.runAfter(0, internal.emails.sendUsageAlert, {
        to: user.email,
        name: user.name,
        metric,
        currentUsage,
        limit,
        percentUsed,
        planName,
      });
    }
  }
} 