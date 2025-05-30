import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { Id } from "./_generated/dataModel";

export const getAgentsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get all agents for this user
    const agents = await ctx.db
      .query("agents")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return agents;
  },
});

export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create new agent
    const agentId = await ctx.db.insert("agents", {
      userId: user._id,
      name: args.name,
      description: args.description,
    });
    
    return agentId;
  },
});

// Public query to get agent by ID (with auth check)
export const getAgentById = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args): Promise<Doc<"agents"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      return null;
    }

    // Verify the agent belongs to the current user
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this agent");
    }

    return agent;
  },
});

// Internal query to get agent by ID (for use in actions)
export const getAgentByIdInternal = internalQuery({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args): Promise<Doc<"agents"> | null> => {
    return await ctx.db.get(args.agentId);
  },
});

// Internal query to get agents for a user by user ID
export const getAgentsForUserId = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
}); 