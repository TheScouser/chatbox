import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { embedTexts } from "./openai";
import type { Doc, Id } from "./_generated/dataModel";

// Internal query to get knowledge entries that need embeddings
export const getKnowledgeEntriesNeedingEmbeddings = internalQuery({
  args: {
    agentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"knowledgeEntries">[]> => {
    const query = ctx.db
      .query("knowledgeEntries")
      .filter((q) => q.eq(q.field("embedding"), undefined));
    
    if (args.agentId) {
      return await query
        .filter((q) => q.eq(q.field("agentId"), args.agentId))
        .take(args.limit || 50);
    }
    
    return await query.take(args.limit || 50);
  },
});

// Internal mutation to update knowledge entry with embedding
export const updateKnowledgeEntryEmbedding = internalMutation({
  args: {
    entryId: v.id("knowledgeEntries"),
    embedding: v.array(v.number()),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.entryId, {
      embedding: args.embedding,
    });
  },
});

// Internal action to generate embeddings for a batch of knowledge entries
export const generateEmbeddingsForEntries = internalAction({
  args: {
    entryIds: v.array(v.id("knowledgeEntries")),
  },
  handler: async (ctx, args): Promise<{ processed: number; errors: number }> => {
    // Get the knowledge entries
    const entries: (Doc<"knowledgeEntries"> | null)[] = await Promise.all(
      args.entryIds.map(async (id: Id<"knowledgeEntries">) => {
        return await ctx.runQuery(internal.knowledge.getKnowledgeEntryById, { entryId: id });
      })
    );
    
    // Filter out any null entries
    const validEntries: Doc<"knowledgeEntries">[] = entries.filter(
      (entry): entry is Doc<"knowledgeEntries"> => entry !== null
    );
    
    if (validEntries.length === 0) {
      return { processed: 0, errors: 0 };
    }
    
    // Prepare texts for embedding
    const texts = validEntries.map((entry: Doc<"knowledgeEntries">) => {
      // Combine title and content for better semantic representation
      const title = entry.title || '';
      const content = entry.content || '';
      return title ? `${title}\n\n${content}` : content;
    });
    
    try {
      // Generate embeddings
      const embeddings = await embedTexts(texts);
      
      // Update each entry with its embedding
      await Promise.all(
        validEntries.map((entry: Doc<"knowledgeEntries">, index: number) =>
          ctx.runMutation(internal.embeddings.updateKnowledgeEntryEmbedding, {
            entryId: entry._id,
            embedding: embeddings[index],
          })
        )
      );
      
      return { processed: validEntries.length, errors: 0 };
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
      return { processed: 0, errors: validEntries.length };
    }
  },
});

// Public action to generate embeddings for a specific agent
export const generateEmbeddingsForAgent = action({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args): Promise<{ message: string; processed: number; errors: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Verify the agent belongs to the current user using queries
    const agent = await ctx.runQuery(internal.agents.getAgentById, { agentId: args.agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
    if (!user || agent.userId !== user._id) {
      throw new Error("Not authorized to generate embeddings for this agent");
    }
    
    // Get knowledge entries that need embeddings
    const entries = await ctx.runQuery(internal.embeddings.getKnowledgeEntriesNeedingEmbeddings, {
      agentId: args.agentId,
      limit: 100, // Process in batches
    });
    
    if (entries.length === 0) {
      return { message: "All knowledge entries already have embeddings", processed: 0, errors: 0 };
    }
    
    // Generate embeddings in batches of 10 to avoid rate limits
    const batchSize = 10;
    let totalProcessed = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const entryIds = batch.map((entry: Doc<"knowledgeEntries">) => entry._id);
      
      const result = await ctx.runAction(internal.embeddings.generateEmbeddingsForEntries, {
        entryIds,
      });
      
      totalProcessed += result.processed;
      totalErrors += result.errors;
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      message: `Generated embeddings for ${totalProcessed} knowledge entries`,
      processed: totalProcessed,
      errors: totalErrors,
    };
  },
});

// Public action to generate embeddings for all knowledge entries
export const generateAllEmbeddings = action({
  args: {},
  handler: async (ctx): Promise<{ message: string; processed: number; errors: number; agents: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get user using internal query instead of direct db access
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user's agents using internal query
    const agents = await ctx.runQuery(internal.agents.getAgentsForUserId, { userId: user._id });
    
    let totalProcessed = 0;
    let totalErrors = 0;
    
    // Process each agent
    for (const agent of agents) {
      const result = await ctx.runQuery(internal.embeddings.getKnowledgeEntriesNeedingEmbeddings, {
        agentId: agent._id,
        limit: 100,
      });
      
      if (result.length > 0) {
        // Generate embeddings in batches of 10 to avoid rate limits
        const batchSize = 10;
        for (let i = 0; i < result.length; i += batchSize) {
          const batch = result.slice(i, i + batchSize);
          const entryIds = batch.map((entry: Doc<"knowledgeEntries">) => entry._id);
          
          const batchResult = await ctx.runAction(internal.embeddings.generateEmbeddingsForEntries, {
            entryIds,
          });
          
          totalProcessed += batchResult.processed;
          totalErrors += batchResult.errors;
          
          // Small delay between batches to respect rate limits
          if (i + batchSize < result.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }
    
    return {
      message: `Generated embeddings for ${totalProcessed} knowledge entries across ${agents.length} agents`,
      processed: totalProcessed,
      errors: totalErrors,
      agents: agents.length,
    };
  },
}); 