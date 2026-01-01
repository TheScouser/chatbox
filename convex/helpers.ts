/**
 * Shared helper functions for Convex backend
 * These provide common functionality used across multiple files
 */

import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Organization member roles
export type OrganizationRole = "owner" | "admin" | "editor" | "viewer";

// Result type for validateOrganizationAccess
export interface AccessValidationResult {
  user: Doc<"users">;
  identity: NonNullable<Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>>;
}

/**
 * Helper function to get user and validate organization access
 * Works with Query and Mutation contexts
 */
export async function validateOrganizationAccessQuery(
  ctx: QueryCtx | MutationCtx,
  organizationId: string | Id<"organizations">,
  requiredRole: OrganizationRole = "viewer"
): Promise<AccessValidationResult> {
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

  // Check if user has required role in organization
  const hasPermission = await ctx.runQuery(internal.organizations.checkPermission, {
    userId: user._id,
    organizationId: organizationId as Id<"organizations">,
    requiredRole,
  });

  if (!hasPermission) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return { user, identity };
}

/**
 * Helper function to get user and validate organization access
 * Works with Action context (uses runQuery for DB access)
 */
export async function validateOrganizationAccessAction(
  ctx: ActionCtx,
  organizationId: string | Id<"organizations">,
  requiredRole: OrganizationRole = "viewer"
): Promise<{ user: Doc<"users">; identity: NonNullable<Awaited<ReturnType<ActionCtx["auth"]["getUserIdentity"]>>> }> {
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
    organizationId: organizationId as Id<"organizations">,
    requiredRole,
  });

  if (!hasPermission) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return { user, identity };
}
