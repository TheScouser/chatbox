import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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