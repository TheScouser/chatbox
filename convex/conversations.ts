import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { validateOrganizationAccessQuery } from "./helpers";

// Use the shared helper function
const validateOrganizationAccess = validateOrganizationAccessQuery;

export const getConversationsForAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent first
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has access to the agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");
    
    // Get all conversations for this agent
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
    
    return conversations;
  },
});

export const getMessagesForConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get the conversation and agent
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const agent = await ctx.db.get(conversation.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to the agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    // Get all messages for this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return messages;
  },
});

export const createConversation = mutation({
  args: {
    agentId: v.id("agents"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to the agent's organization (editor role needed to create)
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      agentId: args.agentId,
      title: args.title || `Conversation ${new Date().toLocaleString()}`,
      isActive: true,
      channelType: "widget",
      status: "open",
    });

    return conversationId;
  },
});


export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.object({
      userId: v.optional(v.string()),
      model: v.optional(v.string()),
      tokensUsed: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the conversation and agent
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const agent = await ctx.db.get(conversation.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to the agent's organization
    const { identity } = await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    // Add user ID to metadata for user messages
    const metadata = args.metadata || {};
    if (args.role === "user") {
      metadata.userId = identity.subject;
    }

    // Create new message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      metadata,
    });

    return messageId;
  },
});

export const getConversationsForUser = query({
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

    // Get user's organization memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get all conversations for all organization agents
    const allConversations = [];
    for (const membership of memberships) {
      const agents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      for (const agent of agents) {
        const conversations = await ctx.db
          .query("conversations")
          .withIndex("agentId", (q) => q.eq("agentId", agent._id))
          .collect();
        allConversations.push(...conversations);
      }
    }

    return allConversations;
  },
});

export const getMessagesForUser = query({
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

    // Get user's organization memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get all conversations for all organization agents
    const allConversations = [];
    for (const membership of memberships) {
      const agents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      for (const agent of agents) {
        const conversations = await ctx.db
          .query("conversations")
          .withIndex("agentId", (q) => q.eq("agentId", agent._id))
          .collect();
        allConversations.push(...conversations);
      }
    }

    // Get all messages for all conversations
    const allMessages = [];
    for (const conversation of allConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("conversationId", (q) => q.eq("conversationId", conversation._id))
        .collect();
      allMessages.push(...messages);
    }

    return allMessages;
  },
});

// Internal mutation to add message (for use in actions)
export const addMessageInternal = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.object({
      userId: v.optional(v.string()),
      model: v.optional(v.string()),
      tokensUsed: v.optional(v.number()),
      knowledgeUsed: v.optional(v.number()),
      error: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
    });
  },
});

// Internal mutation to create conversation (for use in actions)
export const createConversationInternal = internalMutation({
  args: {
    agentId: v.id("agents"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      agentId: args.agentId,
      title: args.title || `Conversation ${new Date().toLocaleString()}`,
      isActive: true,
      channelType: "widget",
      status: "open",
    });
  },
});

// Internal query to get messages for conversation (for use in actions)
export const getMessagesForConversationInternal = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const deleteAllConversationsForAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has admin access to delete conversations
    await validateOrganizationAccess(ctx, agent.organizationId, "admin");
    
    // Get all conversations for this agent
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    // Delete all messages and conversations
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
    
    return { deletedConversations: conversations.length };
  },
}); 