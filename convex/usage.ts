import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { OrganizationRole } from "./types";

// Helper function to validate organization access
async function validateOrganizationAccess(
  ctx: any,
  organizationId: string | Id<"organizations">,
  requiredRole: OrganizationRole = "viewer"
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has required role in organization
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("userId_organizationId", (q: any) => 
      q.eq("userId", user._id).eq("organizationId", organizationId))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .first();

  if (!membership) {
    throw new Error("Not authorized to access this organization");
  }

  const roleHierarchy: OrganizationRole[] = ["viewer", "editor", "admin", "owner"];
  const userRoleIndex = roleHierarchy.indexOf(membership.role as OrganizationRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  if (userRoleIndex < requiredRoleIndex) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return { user, membership };
}


// Get usage overview for organization
export const getUsageOverview = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await validateOrganizationAccess(ctx, args.organizationId, "viewer");

    // Get current plan and limits
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    let planLimits;
    if (subscription) {
      const plan = await ctx.db.get(subscription.planId);
      planLimits = plan?.features;
    } else {
      // Free plan limits
      planLimits = {
        maxAgents: 1,
        maxMessagesPerMonth: 500,
        maxKnowledgeEntries: 50,
        maxFileUploads: 5,
      };
    }

    // Get current usage
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentUsage = await ctx.db
      .query("billingUsage")
      .withIndex("organizationId_period", (q) => 
        q.eq("organizationId", args.organizationId).eq("period", currentPeriod))
      .first();

    // Count current agents
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const messagesUsed = currentUsage?.metrics.messagesUsed || 0;
    const agentsUsed = agents.length;

    return {
      creditsUsed: messagesUsed, // Using messages as "credits"
      creditsLimit: planLimits?.maxMessagesPerMonth || 500,
      agentsUsed,
      agentsLimit: planLimits?.maxAgents || 1,
    };
  },
});

// Get usage history for charts
export const getUsageHistory = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.string(), // ISO date string
    endDate: v.string(), // ISO date string
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    await validateOrganizationAccess(ctx, args.organizationId, "viewer");

    const startTime = new Date(args.startDate).getTime();
    const endTime = new Date(args.endDate).getTime();

    // If specific agent is requested, filter by agent
    let query = ctx.db
      .query("usageTracking")
      .withIndex("organizationId", (q: any) => q.eq("organizationId", args.organizationId))
      .filter((q: any) => 
        q.and(
          q.gte(q.field("lastActivity"), startTime),
          q.lte(q.field("lastActivity"), endTime)
        )
      );

    if (args.agentId) {
      query = ctx.db
        .query("usageTracking")
        .withIndex("agentId", (q: any) => q.eq("agentId", args.agentId))
        .filter((q: any) => 
          q.and(
            q.gte(q.field("lastActivity"), startTime),
            q.lte(q.field("lastActivity"), endTime)
          )
        );
    }

    const usageData = await query.collect();

    // Aggregate data by day
    const dailyUsage = new Map<string, number>();
    
    usageData.forEach((usage) => {
      const date = new Date(usage.lastActivity).toISOString().split('T')[0];
      const currentUsage = dailyUsage.get(date) || 0;
      dailyUsage.set(date, currentUsage + (usage.tokensUsed || usage.messageCount || 0));
    });

    // Convert to array format for charts
    const data: Array<{ date: string; creditsUsed: number }> = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        creditsUsed: dailyUsage.get(dateStr) || 0,
      });
    }

    return {
      data,
      dateRange: {
        start: args.startDate,
        end: args.endDate,
      },
    };
  },
});

// Get usage breakdown by agent
export const getAgentUsageBreakdown = query({
  args: {
    organizationId: v.id("organizations"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    await validateOrganizationAccess(ctx, args.organizationId, "viewer");

    const startTime = new Date(args.startDate).getTime();
    const endTime = new Date(args.endDate).getTime();

    // Get all agents for the organization
    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Get usage data for each agent
    const agentUsage = await Promise.all(
      agents.map(async (agent) => {
        const usageData = await ctx.db
          .query("usageTracking")
          .withIndex("agentId", (q) => q.eq("agentId", agent._id))
          .filter((q) => 
            q.and(
              q.gte(q.field("lastActivity"), startTime),
              q.lte(q.field("lastActivity"), endTime)
            )
          )
          .collect();

        const totalCredits = usageData.reduce((sum, usage) => 
          sum + (usage.tokensUsed || usage.messageCount || 0), 0);
        
        const lastUsed = usageData.length > 0 
          ? Math.max(...usageData.map(u => u.lastActivity))
          : agent._creationTime;

        return {
          agentId: agent._id,
          agentName: agent.name,
          creditsUsed: totalCredits,
          lastUsed: new Date(lastUsed).toISOString(),
        };
      })
    );

    const totalCredits = agentUsage.reduce((sum, agent) => sum + agent.creditsUsed, 0);

    return {
      agents: agentUsage.filter(agent => agent.creditsUsed > 0), // Only show agents with usage
      totalCredits,
    };
  },
});

// Get available agents for filtering
export const getOrganizationAgents = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await validateOrganizationAccess(ctx, args.organizationId, "viewer");

    const agents = await ctx.db
      .query("agents")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      description: agent.description,
    }));
  },
});

// Get current user's default organization for convenience
export const getCurrentUserOrganization = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get user's first active organization membership
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      return null;
    }

    const organization = await ctx.db.get(membership.organizationId);
    
    return {
      organizationId: membership.organizationId,
      organizationName: organization?.name,
      userRole: membership.role,
    };
  },
}); 