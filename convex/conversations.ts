import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConversationsForAgent = query({
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
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Verify the conversation belongs to an agent owned by the current user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    const agent = await ctx.db.get(conversation.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }
    
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
    
    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      agentId: args.agentId,
      title: args.title || `Conversation ${new Date().toLocaleString()}`,
      isActive: true,
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
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Verify the conversation belongs to an agent owned by the current user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    const agent = await ctx.db.get(conversation.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }
    
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