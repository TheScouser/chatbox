import { internalMutation, mutation, query, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper function to generate organization slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Helper function to generate random invitation token
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Create organization (internal, called during user signup)
export const createOrganization = internalMutation({
  args: {
    name: v.string(),
    createdBy: v.id("users"),
    isDefault: v.optional(v.boolean()), // true for default user organizations
  },
  handler: async (ctx, args) => {
    let slug = generateSlug(args.name);
    
    // Ensure slug is unique
    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("slug", (q) => q.eq("slug", uniqueSlug))
        .first();
      
      if (!existing) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: uniqueSlug,
      plan: "free",
    });

    // Add creator as owner
    await ctx.db.insert("organizationMembers", {
      userId: args.createdBy,
      organizationId: orgId,
      role: "owner",
      joinedAt: Date.now(),
      status: "active",
    });

    return orgId;
  },
});

// Get organizations for current user
export const getUserOrganizations = query({
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

    // Get organization details
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          memberRole: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return organizations.filter(org => org !== null);
  },
});

// Get organization by ID (with member role)
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
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

    // Check if user is member of this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Not authorized to access this organization");
    }

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    return {
      ...organization,
      memberRole: membership.role,
    };
  },
});

// Create new organization (from UI)
export const createNewOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // Create organization using internal mutation
    const orgId = await ctx.scheduler.runAfter(0, internal.organizations.createOrganization, {
      name: args.name,
      createdBy: user._id,
    });

    // Update with description if provided
    if (args.description) {
      await ctx.db.patch(orgId, { description: args.description });
    }

    return orgId;
  },
});

// Get organization members
export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
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

    // Check if user is member of this organization
    const userMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!userMembership) {
      throw new Error("Not authorized to view organization members");
    }

    // Get all organization members
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get user details for each member
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        return {
          id: membership._id,
          user: memberUser,
          role: membership.role,
          joinedAt: membership.joinedAt,
          invitedBy: membership.invitedBy,
        };
      })
    );

    return members.filter(member => member.user !== null);
  },
});

// Invite user to organization
export const inviteToOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
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

    // Check if user has permission to invite (admin or owner)
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Not authorized to invite members");
    }

    // Check if user is already invited or member
    const existingMember = await ctx.db
      .query("organizationMembers")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => {
        return q.and(
          q.neq(q.field("status"), "suspended"),
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "invited")
          )
        );
      })
      .collect();

    // Check if email already exists in members
    const existingInvite = await ctx.db
      .query("organizationInvitations")
      .withIndex("email", (q) => q.eq("email", args.email))
      .filter((q) => 
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvite) {
      throw new Error("User already invited");
    }

    // Create invitation
    const token = generateInvitationToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const invitationId = await ctx.db.insert("organizationInvitations", {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
      invitedBy: user._id,
      token,
      expiresAt,
      status: "pending",
    });

    // Send invitation email (schedule as action)
    await ctx.scheduler.runAfter(0, internal.organizations.sendInvitationEmail, {
      invitationId,
    });

    return invitationId;
  },
});

// Send invitation email (internal action)
export const sendInvitationEmail = action({
  args: { invitationId: v.id("organizationInvitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.runQuery(internal.organizations.getInvitationById, {
      invitationId: args.invitationId,
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const organization = await ctx.runQuery(internal.organizations.getOrganizationById, {
      organizationId: invitation.organizationId,
    });

    const inviter = await ctx.runQuery(internal.users.getUserById, {
      userId: invitation.invitedBy,
    });

    if (!organization || !inviter) {
      throw new Error("Missing organization or inviter data");
    }

    // Send email via the emails module
    await ctx.runAction(internal.emails.sendOrganizationInvitationEmail, {
      to: invitation.email,
      organizationName: organization.name,
      inviterName: inviter.name || inviter.email,
      role: invitation.role,
      invitationToken: invitation.token,
    });
  },
});

// Accept organization invitation
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
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

    // Find invitation
    const invitation = await ctx.db
      .query("organizationInvitations")
      .withIndex("token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    if (invitation.email !== identity.email) {
      throw new Error("Invitation email does not match your account");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", invitation.organizationId))
      .first();

    if (existingMembership && existingMembership.status === "active") {
      throw new Error("You are already a member of this organization");
    }

    // Add user to organization
    await ctx.db.insert("organizationMembers", {
      userId: user._id,
      organizationId: invitation.organizationId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation._creationTime,
      joinedAt: Date.now(),
      status: "active",
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, { status: "accepted" });

    return invitation.organizationId;
  },
});

// Remove member from organization
export const removeMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
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

    // Check if user has permission (admin or owner)
    const userMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!userMembership || (userMembership.role !== "admin" && userMembership.role !== "owner")) {
      throw new Error("Not authorized to remove members");
    }

    // Get the member to remove
    const memberToRemove = await ctx.db.get(args.memberId);
    if (!memberToRemove || memberToRemove.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    // Can't remove owner unless you are also an owner
    if (memberToRemove.role === "owner" && userMembership.role !== "owner") {
      throw new Error("Cannot remove organization owner");
    }

    // Can't remove yourself if you're the only owner
    if (memberToRemove.userId === user._id && memberToRemove.role === "owner") {
      const ownerCount = await ctx.db
        .query("organizationMembers")
        .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) => 
          q.and(
            q.eq(q.field("role"), "owner"),
            q.eq(q.field("status"), "active")
          )
        )
        .collect();

      if (ownerCount.length <= 1) {
        throw new Error("Cannot remove the last owner");
      }
    }

    // Remove member
    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});

// Update member role
export const updateMemberRole = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
    newRole: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
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

    // Check if user has permission (owner only)
    const userMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!userMembership || userMembership.role !== "owner") {
      throw new Error("Only organization owners can change member roles");
    }

    // Get the member to update
    const memberToUpdate = await ctx.db.get(args.memberId);
    if (!memberToUpdate || memberToUpdate.organizationId !== args.organizationId) {
      throw new Error("Member not found");
    }

    // Can't change owner role
    if (memberToUpdate.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    // Update role
    await ctx.db.patch(args.memberId, { role: args.newRole });

    return { success: true };
  },
});

// Helper functions for internal use
export const getOrganizationById = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getInvitationById = internalQuery({
  args: { invitationId: v.id("organizationInvitations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.invitationId);
  },
});

// Check if user has permission for an action in an organization
export const checkPermission = internalQuery({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    requiredRole: v.union(v.literal("viewer"), v.literal("editor"), v.literal("admin"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      return false;
    }

    // Role hierarchy: owner > admin > editor > viewer
    const roleHierarchy = { viewer: 1, editor: 2, admin: 3, owner: 4 };
    const userRoleLevel = roleHierarchy[membership.role];
    const requiredRoleLevel = roleHierarchy[args.requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  },
});

// Get user's role in organization
export const getUserRole = internalQuery({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", args.userId).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return membership?.role || null;
  },
}); 