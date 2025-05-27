import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getKnowledgeForAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Verify the agent belongs to the current user
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this agent");
    }
    
    // Get all knowledge entries for this agent
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    return knowledgeEntries;
  },
});

export const createKnowledgeEntry = mutation({
  args: {
    agentId: v.id("agents"),
    content: v.string(),
    source: v.string(),
    sourceMetadata: v.optional(v.object({
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      chunkIndex: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Verify the agent belongs to the current user
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this agent");
    }
    
    // Create new knowledge entry
    const knowledgeEntryId = await ctx.db.insert("knowledgeEntries", {
      agentId: args.agentId,
      content: args.content,
      source: args.source,
      sourceMetadata: args.sourceMetadata,
      embeddings: undefined, // Will be populated later when we add embedding generation
    });
    
    return knowledgeEntryId;
  },
}); 