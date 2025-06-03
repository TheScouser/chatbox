import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper function to get user and validate organization access
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

// Get agents for a specific organization (with role-based access)
export const getAgentsForOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Validate user has at least viewer access to the organization
    await validateOrganizationAccess(ctx, args.organizationId, "viewer");

    return await ctx.db
      .query("agents")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

// Get agents for current user (across all their organizations)
export const getAgentsForUser = query({
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
      return [];
    }

    // Get user's organization memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get agents from all organizations user is a member of
    const allAgents = [];
    for (const membership of memberships) {
      const orgAgents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      // Add organization info and user role to each agent
      const agentsWithOrgInfo = orgAgents.map(agent => ({
        ...agent,
        organization: { 
          id: membership.organizationId,
          userRole: membership.role 
        }
      }));
      
      allAgents.push(...agentsWithOrgInfo);
    }

    return allAgents;
  },
});

export const createAgent = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate user has editor access to create agents
    const { user } = await validateOrganizationAccess(ctx, args.organizationId, "editor");
    
    // Create new agent
    const agentId = await ctx.db.insert("agents", {
      organizationId: args.organizationId,
      createdBy: user._id,
      name: args.name,
      description: args.description,
    });
    
    return agentId;
  },
});

export const getAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to the agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    return agent;
  },
});

// Alias for backward compatibility
export const getAgentById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to the agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    return agent;
  },
});

export const getAgentByIdInternal = internalQuery({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    model: v.optional(v.string()),
    allowedDomains: v.optional(v.array(v.string())),
    widgetSecretKey: v.optional(v.string()),
    domainVerificationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has editor access to the agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");
    
    // Update the agent with only the provided fields
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.instructions !== undefined) updateData.instructions = args.instructions;
    if (args.model !== undefined) updateData.model = args.model;
    if (args.allowedDomains !== undefined) updateData.allowedDomains = args.allowedDomains;
    if (args.widgetSecretKey !== undefined) updateData.widgetSecretKey = args.widgetSecretKey;
    if (args.domainVerificationEnabled !== undefined) updateData.domainVerificationEnabled = args.domainVerificationEnabled;
    
    await ctx.db.patch(args.agentId, updateData);
    
    return args.agentId;
  },
});

export const deleteAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // Validate user has admin access to delete agents
    await validateOrganizationAccess(ctx, agent.organizationId, "admin");
    
    // Delete related data first
    // Delete conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const conversation of conversations) {
      // Delete messages first
      const messages = await ctx.db
        .query("messages")
        .withIndex("conversationId", (q) => q.eq("conversationId", conversation._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete conversation
      await ctx.db.delete(conversation._id);
    }
    
    // Delete knowledge entries
    const knowledgeEntries = await ctx.db
      .query("knowledgeEntries")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const entry of knowledgeEntries) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete files
    const files = await ctx.db
      .query("files")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const file of files) {
      await ctx.db.delete(file._id);
    }
    
    // Delete usage tracking data
    const usageData = await ctx.db
      .query("usageTracking")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const usage of usageData) {
      await ctx.db.delete(usage._id);
    }
    
    // Delete rate limits
    const rateLimits = await ctx.db
      .query("rateLimits")
      .withIndex("agentId_ip", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const rateLimit of rateLimits) {
      await ctx.db.delete(rateLimit._id);
    }
    
    // Delete security incidents
    const securityIncidents = await ctx.db
      .query("securityIncidents")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    for (const incident of securityIncidents) {
      await ctx.db.delete(incident._id);
    }
    
    // Finally, delete the agent
    await ctx.db.delete(args.agentId);
    
    return { success: true };
  },
});

// Legacy function for backward compatibility (deprecated)
export const getAgentsForUserLegacy = query({
  args: {},
  handler: async (ctx) => {
    // This is kept for backward compatibility but should be migrated to getAgentsForUser
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get user's organization memberships
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("userId", (q: any) => q.eq("userId", user._id))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    // Get agents from all organizations user is a member of
    const allAgents = [];
    for (const membership of memberships) {
      const orgAgents = await ctx.db
        .query("agents")
        .withIndex("organizationId", (q: any) => q.eq("organizationId", membership.organizationId))
        .collect();
      
      // Add organization info and user role to each agent
      const agentsWithOrgInfo = orgAgents.map((agent: any) => ({
        ...agent,
        organization: { 
          id: membership.organizationId,
          userRole: membership.role 
        }
      }));
      
      allAgents.push(...agentsWithOrgInfo);
    }

    return allAgents;
  },
}); 