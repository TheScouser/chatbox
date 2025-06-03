import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Rate limiting check
export const checkRateLimit = mutation({
  args: {
    agentId: v.id("agents"),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return { allowed: false, reason: "Agent not found" };

    const now = Date.now();

    // Check minute rate limit
    if (agent.rateLimitPerMinute) {
      const minuteStart = Math.floor(now / 60000) * 60000;
      const minuteLimit = await ctx.db
        .query("rateLimits")
        .withIndex("agentId_ip", (q) => 
          q.eq("agentId", args.agentId).eq("ipAddress", args.ipAddress)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("windowType"), "minute"),
            q.eq(q.field("windowStart"), minuteStart)
          )
        )
        .first();

      if (minuteLimit && minuteLimit.requestCount >= agent.rateLimitPerMinute) {
        return { allowed: false, reason: "Minute rate limit exceeded" };
      }

      // Update or create minute limit record
      if (minuteLimit) {
        await ctx.db.patch(minuteLimit._id, {
          requestCount: minuteLimit.requestCount + 1,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          agentId: args.agentId,
          ipAddress: args.ipAddress,
          requestCount: 1,
          windowStart: minuteStart,
          windowType: "minute",
        });
      }
    }

    // Check daily rate limit
    if (agent.rateLimitPerDay) {
      const dayStart = Math.floor(now / 86400000) * 86400000;
      const dayLimit = await ctx.db
        .query("rateLimits")
        .withIndex("agentId_ip", (q) => 
          q.eq("agentId", args.agentId).eq("ipAddress", args.ipAddress)
        )
        .filter((q) => 
          q.and(
            q.eq(q.field("windowType"), "day"),
            q.eq(q.field("windowStart"), dayStart)
          )
        )
        .first();

      if (dayLimit && dayLimit.requestCount >= agent.rateLimitPerDay) {
        return { allowed: false, reason: "Daily rate limit exceeded" };
      }

      // Update or create day limit record
      if (dayLimit) {
        await ctx.db.patch(dayLimit._id, {
          requestCount: dayLimit.requestCount + 1,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          agentId: args.agentId,
          ipAddress: args.ipAddress,
          requestCount: 1,
          windowStart: dayStart,
          windowType: "day",
        });
      }
    }

    return { allowed: true };
  },
});

// Track usage for monitoring
export const trackUsage = mutation({
  args: {
    agentId: v.id("agents"),
    ipAddress: v.string(),
    domain: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    fingerprint: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find existing usage record for this IP/domain combination
    const existingUsage = await ctx.db
      .query("usageTracking")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .filter((q) => 
        q.and(
          q.eq(q.field("ipAddress"), args.ipAddress),
          q.eq(q.field("domain"), args.domain || "")
        )
      )
      .first();

    if (existingUsage) {
      // Update existing record
      await ctx.db.patch(existingUsage._id, {
        messageCount: existingUsage.messageCount + 1,
        tokensUsed: (existingUsage.tokensUsed || 0) + (args.tokensUsed || 0),
        lastActivity: now,
        userAgent: args.userAgent,
        referrer: args.referrer,
        fingerprint: args.fingerprint,
      });
    } else {
      // Create new usage record
      await ctx.db.insert("usageTracking", {
        agentId: args.agentId,
        ipAddress: args.ipAddress,
        domain: args.domain,
        referrer: args.referrer,
        userAgent: args.userAgent,
        fingerprint: args.fingerprint,
        messageCount: 1,
        tokensUsed: args.tokensUsed || 0,
        lastActivity: now,
      });
    }
  },
});

// Log security incidents
export const logSecurityIncident = mutation({
  args: {
    agentId: v.id("agents"),
    incidentType: v.union(
      v.literal("rate_limit_exceeded"),
      v.literal("unauthorized_domain"),
      v.literal("invalid_signature"),
      v.literal("suspicious_activity"),
      v.literal("blocked_ip"),
      v.literal("referrer_mismatch")
    ),
    ipAddress: v.string(),
    domain: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.string()),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("securityIncidents", {
      agentId: args.agentId,
      incidentType: args.incidentType,
      ipAddress: args.ipAddress,
      domain: args.domain,
      referrer: args.referrer,
      userAgent: args.userAgent,
      details: args.details,
      severity: args.severity,
      resolved: false,
    });
  },
});

// Get usage analytics for an agent
export const getUsageAnalytics = query({
  args: {
    agentId: v.id("agents"),
    timeRange: v.optional(v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify agent ownership
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized");
    }

    const timeRange = args.timeRange || "24h";
    const now = Date.now();
    let startTime: number;

    switch (timeRange) {
      case "24h":
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    // Get usage data
    const usageData = await ctx.db
      .query("usageTracking")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .filter((q) => q.gte(q.field("lastActivity"), startTime))
      .collect();

    // Get security incidents
    const incidents = await ctx.db
      .query("securityIncidents")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .filter((q) => q.gte(q.field("_creationTime"), startTime))
      .collect();

    return {
      totalMessages: usageData.reduce((sum, usage) => sum + usage.messageCount, 0),
      totalTokens: usageData.reduce((sum, usage) => sum + (usage.tokensUsed || 0), 0),
      uniqueIPs: new Set(usageData.map(usage => usage.ipAddress)).size,
      uniqueDomains: new Set(usageData.map(usage => usage.domain).filter(Boolean)).size,
      securityIncidents: incidents.length,
      topDomains: Object.entries(
        usageData.reduce((acc, usage) => {
          const domain = usage.domain || "unknown";
          acc[domain] = (acc[domain] || 0) + usage.messageCount;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 10),
      incidentsByType: Object.entries(
        incidents.reduce((acc, incident) => {
          acc[incident.incidentType] = (acc[incident.incidentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
    };
  },
});

// Block an IP address
export const blockIP = mutation({
  args: {
    agentId: v.id("agents"),
    ipAddress: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized");
    }

    const blockedIPs = agent.blockedIPs || [];
    if (!blockedIPs.includes(args.ipAddress)) {
      await ctx.db.patch(args.agentId, {
        blockedIPs: [...blockedIPs, args.ipAddress],
      });

      // Log the blocking action
      await ctx.db.insert("securityIncidents", {
        agentId: args.agentId,
        incidentType: "blocked_ip",
        ipAddress: args.ipAddress,
        details: `IP manually blocked: ${args.reason || "No reason provided"}`,
        severity: "high",
        resolved: true,
      });
    }
  },
}); 