import { query, mutation, internalQuery } from "./_generated/server";
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
    title: v.optional(v.string()),
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
      title: args.title,
      content: args.content,
      source: args.source,
      sourceMetadata: args.sourceMetadata,
      embedding: undefined, // Will be populated later when we add embedding generation
    });
    
    return knowledgeEntryId;
  },
});

export const updateKnowledgeEntry = mutation({
  args: {
    entryId: v.id("knowledgeEntries"),
    title: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get the knowledge entry
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Knowledge entry not found");
    }
    
    // Verify the agent belongs to the current user
    const agent = await ctx.db.get(entry.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to update this knowledge entry");
    }
    
    // Update the knowledge entry
    await ctx.db.patch(args.entryId, {
      title: args.title,
      content: args.content,
    });
    
    return args.entryId;
  },
});

export const deleteKnowledgeEntry = mutation({
  args: {
    entryId: v.id("knowledgeEntries"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get the knowledge entry
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Knowledge entry not found");
    }
    
    // Verify the agent belongs to the current user
    const agent = await ctx.db.get(entry.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to delete this knowledge entry");
    }
    
    // Delete the knowledge entry
    await ctx.db.delete(args.entryId);
    
    return args.entryId;
  },
});

export const getKnowledgeForUser = query({
  args: {},
  handler: async (ctx) => {
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
    
    // Get all agents for this user
    const agents = await ctx.db
      .query("agents")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    // Get all knowledge entries for all user's agents
    const allKnowledgeEntries = [];
    for (const agent of agents) {
      const knowledgeEntries = await ctx.db
        .query("knowledgeEntries")
        .withIndex("agentId", (q) => q.eq("agentId", agent._id))
        .collect();
      allKnowledgeEntries.push(...knowledgeEntries);
    }
    
    return allKnowledgeEntries;
  },
});

// Internal query to get a knowledge entry by ID
export const getKnowledgeEntryById = internalQuery({
  args: {
    entryId: v.id("knowledgeEntries"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.entryId);
  },
}); 