import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Generate upload URL for authenticated users
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    agentId: v.id("agents"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
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
      throw new Error("Not authorized to upload files for this agent");
    }
    
    // Store file metadata in database
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      agentId: args.agentId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      status: "uploaded", // uploaded, processing, processed, error
    });
    
    return fileId;
  },
});

export const getFileUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Generate URL to access the file
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Internal query to get file by ID
export const getFileById = internalQuery({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

// Internal query to verify file access
export const verifyFileAccess = internalQuery({
  args: {
    fileId: v.id("files"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return false;
    }
    
    const agent = await ctx.db.get(file.agentId);
    if (!agent) {
      return false;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return user !== null && agent.userId === user._id;
  },
});

// Query to get files for an agent
export const getFilesForAgent = query({
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
      throw new Error("Not authorized to view files for this agent");
    }
    
    return await ctx.db
      .query("files")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
  },
}); 