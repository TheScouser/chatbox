import { action, internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { generateChatCompletion, embedText } from "./openai";
import type { Doc, Id } from "./_generated/dataModel";

// Action to generate AI response for a user message
export const generateAIResponse = action({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<{ messageId: Id<"messages">; content: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Get conversation and verify access
    const conversation = await ctx.runQuery(internal.chat.getConversationInternal, {
      conversationId: args.conversationId,
    });
    
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user has access to this conversation
    const agent = await ctx.runQuery(internal.agents.getAgentByIdInternal, { agentId: conversation.agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this conversation");
    }

    // First, add the user message
    const userMessageId = await ctx.runMutation(internal.conversations.addMessageInternal, {
      conversationId: args.conversationId,
      role: "user",
      content: args.userMessage,
      metadata: { userId: identity.subject },
    });

    try {
      // Get relevant knowledge using vector search
      const relevantKnowledge = await ctx.runAction(internal.chat.getRelevantKnowledge, {
        agentId: conversation.agentId,
        query: args.userMessage,
        limit: 5,
      });

      // Get conversation history for context
      const messages = await ctx.runQuery(internal.conversations.getMessagesForConversationInternal, {
        conversationId: args.conversationId,
      });

      // Generate AI response
      const aiResponse = await ctx.runAction(internal.chat.generateResponseWithContext, {
        agentId: conversation.agentId,
        userMessage: args.userMessage,
        relevantKnowledge: relevantKnowledge.map(entry => ({
          _id: entry._id,
          title: entry.title,
          content: entry.content,
          source: entry.source,
          _score: entry._score,
        })), // Only pass required fields, not full database objects
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content,
        })), // Only pass role and content, not full message objects
      });

      // Add the AI response message
      const aiMessageId = await ctx.runMutation(internal.conversations.addMessageInternal, {
        conversationId: args.conversationId,
        role: "assistant",
        content: aiResponse,
        metadata: { 
          model: "gpt-4o-mini",
          knowledgeUsed: relevantKnowledge.length,
        },
      });

      return {
        messageId: aiMessageId,
        content: aiResponse,
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add error message
      const errorMessage = "I apologize, but I'm having trouble generating a response right now. Please try again.";
      const errorMessageId = await ctx.runMutation(internal.conversations.addMessageInternal, {
        conversationId: args.conversationId,
        role: "assistant",
        content: errorMessage,
        metadata: { 
          model: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      return {
        messageId: errorMessageId,
        content: errorMessage,
      };
    }
  },
});

// Internal action to get relevant knowledge for a query
export const getRelevantKnowledge = internalAction({
  args: {
    agentId: v.id("agents"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<Doc<"knowledgeEntries"> & { _score: number }>> => {
    try {
      // Use vector search if embeddings are available
      const queryEmbedding = await embedText(args.query);
      
      const searchResults = await ctx.vectorSearch("knowledgeEntries", "byEmbedding", {
        vector: queryEmbedding,
        limit: args.limit || 5,
      });

      // Filter by agent and get full entries
      const relevantEntries: Array<(Doc<"knowledgeEntries"> & { _score: number }) | null> = await Promise.all(
        searchResults.map(async (result) => {
          const entry = await ctx.runQuery(internal.knowledge.getKnowledgeEntryById, { entryId: result._id });
          if (entry && entry.agentId === args.agentId) {
            return {
              ...entry,
              _score: result._score,
            };
          }
          return null;
        })
      );

      return relevantEntries.filter((entry): entry is Doc<"knowledgeEntries"> & { _score: number } => entry !== null);
    } catch (error) {
      console.error('Vector search failed, falling back to text search:', error);
      
      // Fallback to text search
      const textResults = await ctx.runQuery(internal.vectorSearch.searchKnowledgeInternal, {
        agentId: args.agentId,
        query: args.query,
        limit: args.limit,
      });

      return textResults.map((entry: Doc<"knowledgeEntries">) => ({ ...entry, _score: 0 }));
    }
  },
});

// Internal action to generate response with context
export const generateResponseWithContext = internalAction({
  args: {
    agentId: v.id("agents"),
    userMessage: v.string(),
    relevantKnowledge: v.array(v.object({
      _id: v.id("knowledgeEntries"),
      title: v.optional(v.string()),
      content: v.string(),
      source: v.string(),
      _score: v.number(),
    })),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get agent details for system prompt
    const agent = await ctx.runQuery(internal.agents.getAgentByIdInternal, { agentId: args.agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Build context from relevant knowledge
    const knowledgeContext = args.relevantKnowledge
      .map((entry, index) => `[${index + 1}] ${entry.title || 'Knowledge Entry'}: ${entry.content}`)
      .join('\n\n');

    // Build system prompt
    const systemPrompt = `You are ${agent.name}, an AI assistant. ${agent.description || ''}

You have access to the following knowledge base to help answer questions:

${knowledgeContext}

Instructions:
- Use the knowledge base to provide accurate, helpful responses
- If the knowledge base doesn't contain relevant information, say so politely
- Be conversational and helpful
- Keep responses concise but informative
- Reference specific knowledge when relevant`;

    // Build conversation messages
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...args.conversationHistory.slice(-8), // Include recent history for context
      { role: "user" as const, content: args.userMessage },
    ];

    // Generate response using OpenAI
    const completion = await generateChatCompletion(messages, {
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 500,
      stream: false, // Ensure we get a non-streaming response
    });

    // Type guard to ensure we have a non-streaming response
    if ('choices' in completion) {
      return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
    } else {
      throw new Error("Unexpected streaming response from OpenAI");
    }
  },
});

// Internal query to get conversation details
export const getConversationInternal = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args): Promise<Doc<"conversations"> | null> => {
    return await ctx.db.get(args.conversationId);
  },
});

// Action to start a new conversation
export const startConversation = action({
  args: {
    agentId: v.id("agents"),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ conversationId: Id<"conversations">; messageId?: Id<"messages"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Verify user has access to this agent
    const agent = await ctx.runQuery(internal.agents.getAgentByIdInternal, { agentId: args.agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to access this agent");
    }

    // Create new conversation
    const conversationId = await ctx.runMutation(internal.conversations.createConversationInternal, {
      agentId: args.agentId,
      title: `Chat with ${agent.name}`,
    });

    // Add initial message if provided
    let messageId: Id<"messages"> | undefined;
    if (args.initialMessage) {
      // Add the user message first
      messageId = await ctx.runMutation(internal.conversations.addMessageInternal, {
        conversationId,
        role: "user",
        content: args.initialMessage,
        metadata: { userId: identity.subject },
      });

      // Generate AI response (this will be handled by the frontend calling generateAIResponse)
    }

    return { conversationId, messageId };
  },
});