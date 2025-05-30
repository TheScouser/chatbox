import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    return {
      id: identity.subject,
      email: identity.email,
      name: identity.name,
      tokenIdentifier: identity.tokenIdentifier,
      dbUser: user,
    };
  },
});

export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (existingUser) {
      return existingUser._id;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name || undefined,
    });
    
    return userId;
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