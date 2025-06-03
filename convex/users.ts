import { internalMutation, query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Create user (called during auth flow)
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
    });

    // Create default organization for the user
    const defaultOrgName = args.name ? `${args.name}'s Team` : `${args.email.split('@')[0]}'s Team`;
    const orgId = await ctx.scheduler.runAfter(0, internal.organizations.createOrganization, {
      name: defaultOrgName,
      createdBy: userId,
      isDefault: true,
    });

    // Send welcome email
    if (args.email && args.name) {
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
          to: args.email,
          name: args.name,
        });
        console.log(`Scheduled welcome email for new user: ${args.email}`);
      } catch (error) {
        console.error("Failed to schedule welcome email:", error);
      }
    }

    return userId;
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
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

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// Get user by ID (internal)
export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Internal query to get a user by Clerk ID
export const getUserByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
}); 