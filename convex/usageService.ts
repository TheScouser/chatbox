import { query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// ============ HELPER FUNCTIONS ============

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getFreePlanLimits() {
  return {
    aiCredits: 100,
    knowledgeCharacters: 500000,
    emailCredits: 25,
    maxChatbots: 2,
    maxSeats: 1,
    maxAiActionsPerAgent: 1,
    voiceMinutes: 0,
    resyncCredits: 0,
    maxFileSizeMB: 1,
    prioritySupport: false,
    customDomains: false,
    advancedAnalytics: false,
    apiAccess: false,
    webhookIntegrations: false,
    customBranding: false,
    exportChats: false,
    exportLeads: false,
    downloadTranscripts: false,
  };
}

async function getPlanLimits(ctx: any, organizationId: Id<"organizations">) {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("organizationId", (q: any) => q.eq("organizationId", organizationId))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .first();

  if (subscription) {
    const plan = await ctx.db.get(subscription.planId);
    if (plan) {
      return plan.features;
    }
  }

  return getFreePlanLimits();
}

// Get billing usage (for queries - doesn't create if missing)
async function getBillingUsage(
  ctx: any,
  organizationId: Id<"organizations">,
  period: string
) {
  const existing = await ctx.db
    .query("billingUsage")
    .withIndex("organizationId_period", (q: any) =>
      q.eq("organizationId", organizationId).eq("period", period)
    )
    .first();

  if (existing) {
    return existing;
  }

  // Return default usage if not found (for queries)
  return {
    metrics: {
      aiCreditsUsed: 0,
      knowledgeCharactersUsed: 0,
      emailCreditsUsed: 0,
      voiceMinutesUsed: 0,
      resyncCreditsUsed: 0,
    },
  };
}

// Get or create billing usage (for mutations - can create if missing)
async function getOrCreateBillingUsage(
  ctx: any,
  organizationId: Id<"organizations">,
  period: string
) {
  const existing = await ctx.db
    .query("billingUsage")
    .withIndex("organizationId_period", (q: any) =>
      q.eq("organizationId", organizationId).eq("period", period)
    )
    .first();

  if (existing) {
    return existing;
  }

  // Create new usage record (only works in mutations)
  const newUsageId = await ctx.db.insert("billingUsage", {
    organizationId,
    period,
    metrics: {
      aiCreditsUsed: 0,
      knowledgeCharactersUsed: 0,
      emailCreditsUsed: 0,
      voiceMinutesUsed: 0,
      resyncCreditsUsed: 0,
    },
    lastUpdated: Date.now(),
  });

  return await ctx.db.get(newUsageId);
}

// ============ QUERIES ============

// Check if AI credit is available (call before generating response)
export const checkAiCreditAvailable = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // 1. Get current period (YYYY-MM)
    const period = getCurrentPeriod();

    // 2. Get organization's plan limits (or free plan defaults)
    const planLimits = await getPlanLimits(ctx, args.organizationId);

    // 3. Get current usage from billingUsage
    const usage = await getBillingUsage(ctx, args.organizationId, period);
    const current = usage.metrics.aiCreditsUsed;
    const limit = planLimits.aiCredits;

    // 4. Return { allowed: boolean, current: number, limit: number, remaining: number }
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  },
});

// Check if knowledge characters can be added
export const checkKnowledgeCharactersAvailable = internalQuery({
  args: {
    organizationId: v.id("organizations"),
    additionalChars: v.number(),
  },
  handler: async (ctx, args) => {
    // Get plan limits
    const planLimits = await getPlanLimits(ctx, args.organizationId);

    // Get current usage (this is TOTAL, not monthly - sum all knowledge entries)
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .collect();

    let totalChars = 0;
    for (const agent of agents) {
      const knowledgeEntries = await ctx.db
        .query("knowledgeEntries")
        .withIndex("agentId", (q: any) => q.eq("agentId", agent._id))
        .collect();

      for (const entry of knowledgeEntries) {
        totalChars += entry.content.length;
      }
    }

    const current = totalChars;
    const limit = planLimits.knowledgeCharacters;
    const newTotal = current + args.additionalChars;

    return {
      allowed: newTotal <= limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      wouldExceed: newTotal > limit,
    };
  },
});

// Check if can create another chatbot
export const checkChatbotLimitAvailable = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Count current agents
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .collect();

    const current = agents.length;

    // Get plan limits
    const planLimits = await getPlanLimits(ctx, args.organizationId);
    const limit = planLimits.maxChatbots;

    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  },
});

// Get full usage summary for dashboard
export const getUsageSummary = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Verify user has access
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
        q.eq("userId", user._id).eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("No access to this organization");
    }

    const period = getCurrentPeriod();
    const planLimits = await getPlanLimits(ctx, args.organizationId);
    const usage = await getBillingUsage(ctx, args.organizationId, period);

    // Count chatbots
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .collect();
    const chatbotsCurrent = agents.length;

    // Count seats (active organization members)
    const seats = await ctx.db
      .query("organizationMembers")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();
    const seatsCurrent = seats.length;

    // Calculate knowledge characters (TOTAL, not monthly)
    let knowledgeCharsCurrent = 0;
    for (const agent of agents) {
      const knowledgeEntries = await ctx.db
        .query("knowledgeEntries")
        .withIndex("agentId", (q: any) => q.eq("agentId", agent._id))
        .collect();

      for (const entry of knowledgeEntries) {
        knowledgeCharsCurrent += entry.content.length;
      }
    }

    return {
      aiCredits: {
        current: usage.metrics.aiCreditsUsed,
        limit: planLimits.aiCredits,
        percentUsed: (usage.metrics.aiCreditsUsed / planLimits.aiCredits) * 100,
      },
      knowledgeCharacters: {
        current: knowledgeCharsCurrent,
        limit: planLimits.knowledgeCharacters,
        percentUsed: (knowledgeCharsCurrent / planLimits.knowledgeCharacters) * 100,
      },
      emailCredits: {
        current: usage.metrics.emailCreditsUsed,
        limit: planLimits.emailCredits,
        percentUsed: (usage.metrics.emailCreditsUsed / planLimits.emailCredits) * 100,
      },
      chatbots: {
        current: chatbotsCurrent,
        limit: planLimits.maxChatbots,
        percentUsed: (chatbotsCurrent / planLimits.maxChatbots) * 100,
      },
      seats: {
        current: seatsCurrent,
        limit: planLimits.maxSeats,
        percentUsed: (seatsCurrent / planLimits.maxSeats) * 100,
      },
      voiceMinutes: {
        current: usage.metrics.voiceMinutesUsed,
        limit: planLimits.voiceMinutes,
        percentUsed: planLimits.voiceMinutes > 0
          ? (usage.metrics.voiceMinutesUsed / planLimits.voiceMinutes) * 100
          : 0,
      },
      resyncCredits: {
        current: usage.metrics.resyncCreditsUsed,
        limit: planLimits.resyncCredits,
        percentUsed: planLimits.resyncCredits > 0
          ? (usage.metrics.resyncCreditsUsed / planLimits.resyncCredits) * 100
          : 0,
      },
    };
  },
});

// ============ MUTATIONS ============

// Track AI credit usage (call after successful response)
export const trackAiCredit = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    creditsUsed: v.number(), // Usually 1, could be more for complex ops
  },
  handler: async (ctx, args) => {
    // 1. Get or create billingUsage for current period
    const period = getCurrentPeriod();
    const usage = await getOrCreateBillingUsage(ctx, args.organizationId, period);

    // 2. Increment aiCreditsUsed
    const newValue = usage.metrics.aiCreditsUsed + args.creditsUsed;
    await ctx.db.patch(usage._id, {
      metrics: {
        ...usage.metrics,
        aiCreditsUsed: newValue,
      },
      lastUpdated: Date.now(),
    });

    // 3. Check if should send usage alert (75%, 90%)
    const planLimits = await getPlanLimits(ctx, args.organizationId);
    const limit = planLimits.aiCredits;
    const percentUsed = (newValue / limit) * 100;

    // Get plan name for email
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .first();
    const planName = subscription
      ? (await ctx.db.get(subscription.planId))?.name || "Free"
      : "Free";

    if (percentUsed >= 75 && percentUsed < 90) {
      // Send warning alert to admins/owners
      await sendUsageAlertToAdmins(
        ctx,
        args.organizationId,
        "AI Credits",
        newValue,
        limit,
        percentUsed,
        planName
      );
    } else if (percentUsed >= 90) {
      // Send critical alert to admins/owners
      await sendUsageAlertToAdmins(
        ctx,
        args.organizationId,
        "AI Credits",
        newValue,
        limit,
        percentUsed,
        planName
      );
    }
  },
});

// Track knowledge character usage
export const trackKnowledgeCharacters = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    characters: v.number(),
    operation: v.union(v.literal("add"), v.literal("remove")),
  },
  handler: async (ctx, args) => {
    // Note: We don't track this in billingUsage since it's a total, not monthly
    // But we can still track it for analytics if needed
    // For now, we'll just validate in the query, not track here
    // This mutation exists for consistency but doesn't need to do anything
    // since knowledgeCharactersUsed is calculated from actual entries
  },
});

// Track email credit usage
export const trackEmailCredit = internalMutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const period = getCurrentPeriod();
    const usage = await getOrCreateBillingUsage(ctx, args.organizationId, period);

    const newValue = usage.metrics.emailCreditsUsed + 1;
    await ctx.db.patch(usage._id, {
      metrics: {
        ...usage.metrics,
        emailCreditsUsed: newValue,
      },
      lastUpdated: Date.now(),
    });

    // Check for alerts
    const planLimits = await getPlanLimits(ctx, args.organizationId);
    const limit = planLimits.emailCredits;
    const percentUsed = (newValue / limit) * 100;

    // Get plan name for email
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .first();
    const planName = subscription
      ? (await ctx.db.get(subscription.planId))?.name || "Free"
      : "Free";

    if (percentUsed >= 75 && percentUsed < 90) {
      await sendUsageAlertToAdmins(
        ctx,
        args.organizationId,
        "Email Credits",
        newValue,
        limit,
        percentUsed,
        planName
      );
    } else if (percentUsed >= 90) {
      await sendUsageAlertToAdmins(
        ctx,
        args.organizationId,
        "Email Credits",
        newValue,
        limit,
        percentUsed,
        planName
      );
    }
  },
});

// Helper function to send usage alerts to organization admins/owners
async function sendUsageAlertToAdmins(
  ctx: any,
  organizationId: Id<"organizations">,
  metric: string,
  currentUsage: number,
  limit: number,
  percentUsed: number,
  planName: string
) {
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
