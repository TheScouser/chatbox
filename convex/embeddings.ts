import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { embedTexts } from "./openai";
import type { Doc, Id } from "./_generated/dataModel";

// Helper function to get user and validate organization access (modified for action context)
async function validateOrganizationAccess(
  ctx: any,
  organizationId: string,
  requiredRole: "viewer" | "editor" | "admin" | "owner" = "viewer"
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: identity.subject });
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has required role in organization
  const hasPermission = await ctx.runQuery(internal.organizations.checkPermission, {
    userId: user._id,
    organizationId: organizationId as any,
    requiredRole,
  });

  if (!hasPermission) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return { user, identity };
}

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
    // Verify the agent belongs to an organization the user has access to
    const agent = await ctx.runQuery(internal.agents.getAgentByIdInternal, { agentId: args.agentId });
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to generate embeddings
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
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
    
    // For now, return a message directing users to generate embeddings per agent
    // This avoids the complexity of querying across organizations until we have
    // the proper internal functions set up
    return {
      message: "Please generate embeddings for each agent individually using the generateEmbeddingsForAgent function",
      processed: 0,
      errors: 0,
      agents: 0,
    };
  },
}); 