import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

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

// Helper function to chunk large text into smaller pieces for better embeddings
function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 100): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxChunkSize;
    
    // If we're not at the end, try to break at a sentence or paragraph boundary
    if (end < text.length) {
      // Look for paragraph break first
      const paragraphBreak = text.lastIndexOf('\n\n', end);
      if (paragraphBreak > start + maxChunkSize * 0.5) {
        end = paragraphBreak + 2;
      } else {
        // Look for sentence break
        const sentenceBreak = text.lastIndexOf('. ', end);
        if (sentenceBreak > start + maxChunkSize * 0.5) {
          end = sentenceBreak + 2;
        } else {
          // Look for any whitespace
          const spaceBreak = text.lastIndexOf(' ', end);
          if (spaceBreak > start + maxChunkSize * 0.5) {
            end = spaceBreak + 1;
          }
        }
      }
    }
    
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position with overlap
    start = end - overlap;
    if (start >= text.length) break;
  }
  
  return chunks;
}

// Internal mutation to create knowledge entries from extracted text
export const createKnowledgeFromText = internalMutation({
  args: {
    agentId: v.id("agents"),
    text: v.string(),
    source: v.string(),
    sourceMetadata: v.object({
      filename: v.optional(v.string()),
    }),
    fileId: v.id("files"),
  },
  handler: async (ctx, args): Promise<Id<"knowledgeEntries">[]> => {
    // Chunk the text for better embeddings and retrieval
    const chunks = chunkText(args.text, 1000, 100);
    const knowledgeEntryIds: Id<"knowledgeEntries">[] = [];
    
    console.log(`Creating ${chunks.length} knowledge entries from ${args.sourceMetadata.filename}`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const title = chunks.length > 1 
        ? `${args.sourceMetadata.filename} (Part ${i + 1}/${chunks.length})`
        : `Document: ${args.sourceMetadata.filename}`;
      
      const knowledgeEntryId = await ctx.db.insert("knowledgeEntries", {
        agentId: args.agentId,
        title,
        content: chunk,
        source: args.source,
        sourceMetadata: {
          ...args.sourceMetadata,
          chunkIndex: chunks.length > 1 ? i : undefined,
          totalChunks: chunks.length > 1 ? chunks.length : undefined,
        },
      });
      
      knowledgeEntryIds.push(knowledgeEntryId);
    }
    
    return knowledgeEntryIds;
  },
});

// Internal mutation to update file status
export const updateFileStatus = internalMutation({
  args: {
    fileId: v.id("files"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"), 
      v.literal("processed"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, { status: args.status });
  },
}); 