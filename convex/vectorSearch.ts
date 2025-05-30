import { query, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import { embedText } from "./openai";
import type { Doc, Id } from "./_generated/dataModel";

// Query to perform vector search on knowledge entries
export const searchKnowledge = query({
  args: {
    agentId: v.id("agents"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"knowledgeEntries">[]> => {
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
      throw new Error("Not authorized to search this agent's knowledge");
    }
    
    // For now, return a simple text-based search
    // This will be replaced with vector search once embeddings are generated
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    // Simple text search for now
    const queryLower = args.query.toLowerCase();
    const filteredEntries = knowledgeEntries.filter(entry => 
      entry.content.toLowerCase().includes(queryLower) ||
      (entry.title && entry.title.toLowerCase().includes(queryLower))
    );
    
    return filteredEntries.slice(0, args.limit || 10);
  },
});

// Action to perform semantic vector search
export const semanticSearch = action({
  args: {
    agentId: v.id("agents"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<Doc<"knowledgeEntries"> & { _score: number }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    try {
      // Generate embedding for the search query
      const queryEmbedding = await embedText(args.query);
      
      // Perform vector search using Convex's vector search
      const searchResults = await ctx.vectorSearch("knowledgeEntries", "byEmbedding", {
        vector: queryEmbedding,
        limit: args.limit || 8,
      });
      
      // Get the full knowledge entries and filter by agent
      const knowledgeEntries: Array<(Doc<"knowledgeEntries"> & { _score: number }) | null> = await Promise.all(
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
      
      // Filter out null entries
      const validEntries: Array<Doc<"knowledgeEntries"> & { _score: number }> = knowledgeEntries.filter(
        (entry): entry is Doc<"knowledgeEntries"> & { _score: number } => entry !== null
      );
      
      // Verify authorization if we have results
      if (validEntries.length > 0) {
        const agent = await ctx.runQuery(internal.agents.getAgentById, { agentId: args.agentId });
        if (!agent) {
          throw new Error("Agent not found");
        }
        
        const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
        if (!user || agent.userId !== user._id) {
          throw new Error("Not authorized to search this agent's knowledge");
        }
      }
      
      return validEntries;
    } catch (error) {
      console.error('Semantic search error:', error);
      
      // Fallback to text-based search if vector search fails
      const fallbackResults = await ctx.runQuery(internal.vectorSearch.searchKnowledgeInternal, {
        agentId: args.agentId,
        query: args.query,
        limit: args.limit,
      });
      
      // Add dummy scores for consistency
      return fallbackResults.map((entry: Doc<"knowledgeEntries">) => ({ ...entry, _score: 0 }));
    }
  },
});

// Query to get knowledge retrieval statistics
export const getKnowledgeStats = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args): Promise<{
    totalEntries: number;
    entriesWithEmbeddings: number;
    entriesNeedingEmbeddings: number;
    embeddingProgress: number;
  }> => {
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
    
    // Count entries with and without embeddings
    const totalEntries = knowledgeEntries.length;
    const entriesWithEmbeddings = knowledgeEntries.filter(entry => entry.embedding).length;
    const entriesNeedingEmbeddings = totalEntries - entriesWithEmbeddings;
    
    return {
      totalEntries,
      entriesWithEmbeddings,
      entriesNeedingEmbeddings,
      embeddingProgress: totalEntries > 0 ? (entriesWithEmbeddings / totalEntries) * 100 : 0,
    };
  },
});

// Internal query version of searchKnowledge for use in actions
export const searchKnowledgeInternal = internalQuery({
  args: {
    agentId: v.id("agents"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"knowledgeEntries">[]> => {
    // Get all knowledge entries for this agent
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    // Simple text search
    const queryLower = args.query.toLowerCase();
    const filteredEntries = knowledgeEntries.filter(entry => 
      entry.content.toLowerCase().includes(queryLower) ||
      (entry.title && entry.title.toLowerCase().includes(queryLower))
    );
    
    return filteredEntries.slice(0, args.limit || 10);
  },
}); 