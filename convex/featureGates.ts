import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Check if user has access to a specific feature
export const checkFeatureAccess = query({
  args: { 
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
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

// Check usage limits for a specific metric
export const checkUsageLimit = query({
  args: {
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

    // Get current plan limits
    let planLimits;
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
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
    const currentUsage = await getCurrentUsage(ctx, user._id, args.metric);
    
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

// Track usage for billing
export const trackUsage = mutation({
  args: {
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

    const currentPeriod = getCurrentPeriod();
    
    // Get or create usage record for current period
    const existingUsage = await ctx.db
      .query("billingUsage")
      .withIndex("userId_period", (q) => q.eq("userId", user._id).eq("period", currentPeriod))
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
      // Update existing usage
      const updatedMetrics = {
        ...existingUsage.metrics,
        [metricKey]: (existingUsage.metrics[metricKey as keyof typeof existingUsage.metrics] || 0) + args.amount
      };
      
      await ctx.db.patch(existingUsage._id, {
        metrics: updatedMetrics,
        lastUpdated: Date.now()
      });

      // Check if we should send usage alert
      await checkAndSendUsageAlert(ctx, user, args.metric, updatedMetrics[metricKey as keyof typeof updatedMetrics] as number);
    } else {
      // Create new usage record
      const metrics = {
        messagesUsed: 0,
        agentsCreated: 0,
        knowledgeEntriesAdded: 0,
        filesUploaded: 0,
        storageUsedMB: 0,
        apiCallsMade: 0,
        [metricKey]: args.amount
      };

      await ctx.db.insert("billingUsage", {
        userId: user._id,
        period: currentPeriod,
        metrics,
        lastUpdated: Date.now()
      });

      // Check if we should send usage alert
      await checkAndSendUsageAlert(ctx, user, args.metric, args.amount);
    }

    return { success: true };
  },
});

// Helper functions
async function getCurrentUsage(ctx: any, userId: string, metric: string): Promise<number> {
  const currentPeriod = getCurrentPeriod();
  
  if (metric === "agents") {
    // Count current agents
    const agents = await ctx.db
      .query("agents")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .collect();
    return agents.length;
  }

  if (metric === "knowledge_entries") {
    // Count knowledge entries across all user's agents
    const agents = await ctx.db
      .query("agents")
      .withIndex("userId", (q: any) => q.eq("userId", userId))
      .collect();
    
    let totalEntries = 0;
    for (const agent of agents) {
      const entries = await ctx.db
        .query("knowledgeEntries")
        .withIndex("agentId", (q: any) => q.eq("agentId", agent._id))
        .collect();
      totalEntries += entries.length;
    }
    return totalEntries;
  }

  // For time-based metrics, check billing usage
  const usage = await ctx.db
    .query("billingUsage")
    .withIndex("userId_period", (q: any) => q.eq("userId", userId).eq("period", currentPeriod))
    .first();

  if (!usage) return 0;

  const metricMap: Record<string, keyof typeof usage.metrics> = {
    "messages": "messagesUsed",
    "file_uploads": "filesUploaded"
  };

  const metricKey = metricMap[metric];
  return usage.metrics[metricKey] || 0;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getSuggestedUpgrade(feature: string): string {
  const upgradeMap: Record<string, string> = {
    "priority_support": "standard",
    "custom_domains": "starter", 
    "advanced_analytics": "standard",
    "api_access": "standard",
    "webhook_integrations": "standard",
    "custom_branding": "pro",
    "sso_integration": "pro",
    "audit_logs": "pro"
  };

  return upgradeMap[feature] || "starter";
}

// Helper function to check and send usage alerts
async function checkAndSendUsageAlert(ctx: any, user: any, metric: string, currentUsage: number) {
  // Get user's current plan limits
  let planLimits;
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("userId", (q: any) => q.eq("userId", user._id))
    .filter((q: any) => q.eq(q.field("status"), "active"))
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

  if (!planLimits) return;

  const limitMap: Record<string, keyof typeof planLimits> = {
    "agents": "maxAgents",
    "messages": "maxMessagesPerMonth",
    "knowledge_entries": "maxKnowledgeEntries", 
    "file_uploads": "maxFileUploads"
  };

  const limitKey = limitMap[metric];
  if (!limitKey) return;

  const limit = planLimits[limitKey] as number;
  const percentUsed = (currentUsage / limit) * 100;

  // Send alerts at 80% and 95% thresholds
  if (percentUsed >= 80 && user.email) {
    // Check if we've already sent an alert for this metric/period
    const alertKey = `usage_alert_${metric}_${getCurrentPeriod()}_${percentUsed >= 95 ? '95' : '80'}`;
    
    // In a real implementation, you'd want to track sent alerts in the database
    // For now, we'll send the alert and log it
    const planName = subscription ? (await ctx.db.get(subscription.planId))?.name || "Free" : "Free";
    
    try {
      await ctx.scheduler.runAfter(0, internal.emails.sendUsageAlert, {
        to: user.email,
        name: user.name || "Customer",
        metric: metric.replace('_', ' '),
        currentUsage,
        limit,
        percentUsed,
        planName,
      });
      
      console.log(`Sent usage alert for ${metric} at ${percentUsed.toFixed(1)}% to ${user.email}`);
    } catch (error) {
      console.error("Failed to schedule usage alert email:", error);
    }
  }
} 