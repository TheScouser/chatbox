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

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    model: v.optional(v.string()),
    allowedDomains: v.optional(v.array(v.string())),
    widgetSecretKey: v.optional(v.string()),
    domainVerificationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Verify the agent belongs to the current user
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to update this agent");
    }
    
    // Update the agent with only the provided fields
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.instructions !== undefined) updateData.instructions = args.instructions;
    if (args.model !== undefined) updateData.model = args.model;
    if (args.allowedDomains !== undefined) updateData.allowedDomains = args.allowedDomains;
    if (args.widgetSecretKey !== undefined) updateData.widgetSecretKey = args.widgetSecretKey;
    if (args.domainVerificationEnabled !== undefined) updateData.domainVerificationEnabled = args.domainVerificationEnabled;
    
    await ctx.db.patch(args.agentId, updateData);
    
    return args.agentId;
  },
});

export const deleteAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Verify the agent belongs to the current user
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to delete this agent");
    }
    
    // Delete all related data
    // 1. Delete all knowledge entries
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const entry of knowledgeEntries) {
      await ctx.db.delete(entry._id);
    }
    
    // 2. Delete all conversations and their messages
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const conversation of conversations) {
      // Delete all messages in this conversation
      const messages = await ctx.db
        .query("messages")
        .withIndex("conversationId", (q) => q.eq("conversationId", conversation._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the conversation
      await ctx.db.delete(conversation._id);
    }
    
    // 3. Delete all files
    const files = await ctx.db
      .query("files")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const file of files) {
      await ctx.db.delete(file._id);
    }
    
    // 4. Finally, delete the agent
    await ctx.db.delete(args.agentId);
    
    return args.agentId;
  },
}); 