import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { validateOrganizationAccessQuery } from "./helpers";

// Use the shared helper function
const validateOrganizationAccess = validateOrganizationAccessQuery;


export const getKnowledgeForAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has viewer access to see knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");
    
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
    source: v.union(
      v.literal("text"),
      v.literal("document"),
      v.literal("url"),
      v.literal("qna"),
    ),
    sourceMetadata: v.optional(
      v.object({
        filename: v.optional(v.string()),
        url: v.optional(v.string()),
        chunkIndex: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to add knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
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
    // Get the knowledge entry
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Knowledge entry not found");
    }
    
    // Get the agent
    const agent = await ctx.db.get(entry.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to update knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
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
    // Get the knowledge entry
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Knowledge entry not found");
    }
    
    // Get the agent
    const agent = await ctx.db.get(entry.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to delete knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
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
    
    // Get user's organization memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get all knowledge entries from all organization agents
    const allKnowledgeEntries = [];
    for (const membership of memberships) {
      const agents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      for (const agent of agents) {
        const knowledgeEntries = await ctx.db
          .query("knowledgeEntries")
          .withIndex("agentId", (q) => q.eq("agentId", agent._id))
          .collect();
        allKnowledgeEntries.push(...knowledgeEntries);
      }
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
    source: v.union(v.literal("text"), v.literal("document"), v.literal("url")),
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
      const title =
        chunks.length > 1
          ? `${args.sourceMetadata.filename} (Part ${i + 1}/${chunks.length})`
          : `Document: ${args.sourceMetadata.filename}`;
      
      const knowledgeEntryId = await ctx.db.insert("knowledgeEntries", {
        agentId: args.agentId,
        title,
        content: chunk,
        source: args.source,
        fileId: args.fileId,
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

export const addKnowledgeEntry = mutation({
  args: {
    agentId: v.id("agents"),
    title: v.optional(v.string()),
    content: v.string(),
    source: v.union(
      v.literal("text"),
      v.literal("document"),
      v.literal("url"),
      v.literal("qna"),
    ),
    sourceMetadata: v.optional(
      v.object({
        filename: v.optional(v.string()),
        url: v.optional(v.string()),
        chunkIndex: v.optional(v.number()),
        totalChunks: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to add knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
    // Create the knowledge entry
    const entryId = await ctx.db.insert("knowledgeEntries", {
      agentId: args.agentId,
      title: args.title,
      content: args.content,
      source: args.source,
      sourceMetadata: args.sourceMetadata,
    });
    
    return entryId;
  },
});

export const getKnowledgeEntries = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has viewer access to see knowledge
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");
    
    // Get all knowledge entries for this agent
    const entries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    return entries;
  },
});

export const getKnowledgeEntriesForUser = query({
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

    // Get all knowledge entries from all organization agents
    const allEntries = [];
    for (const membership of memberships) {
      const agents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      for (const agent of agents) {
        const entries = await ctx.db
          .query("knowledgeEntries")
          .withIndex("agentId", (q) => q.eq("agentId", agent._id))
          .collect();
        allEntries.push(...entries);
      }
    }

    return allEntries;
  },
});

// Migration function to fix knowledge entries missing fileId
export const fixMissingFileIds = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
    // Get all files for this agent
    const files = await ctx.db
      .query("files")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    // Get all knowledge entries for this agent that are missing fileId
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .filter((q) => q.eq(q.field("source"), "document"))
      .collect();
    
    let fixed = 0;
    
    for (const entry of knowledgeEntries) {
      // Skip if already has fileId
      if (entry.fileId) continue;
      
      // Find matching file by filename
      const filename = entry.sourceMetadata?.filename;
      if (!filename) continue;
      
      const matchingFile = files.find(file => file.filename === filename);
      if (matchingFile) {
        await ctx.db.patch(entry._id, { fileId: matchingFile._id });
        fixed++;
        console.log(`Fixed knowledge entry ${entry._id} with fileId ${matchingFile._id}`);
      }
    }
    
    return { message: `Fixed ${fixed} knowledge entries`, fixed };
  },
}); 