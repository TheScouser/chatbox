import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper function to get user and validate organization access (copied from agents.ts)
async function validateOrganizationAccess(
  ctx: any,
  organizationId: string,
  requiredRole: "viewer" | "editor" | "admin" | "owner" = "viewer"
) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .first();

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
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to upload files
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
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
    
    if (!user) {
      return false;
    }

    // Check if user has access to the agent's organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", agent.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    return membership !== null;
  },
});

// Query to get files for an agent
export const getFilesForAgent = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has viewer access to see files
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");
    
    // Get all files for this agent
    const files = await ctx.db
      .query("files")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    return files;
  },
}); 