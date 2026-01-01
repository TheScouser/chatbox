/**
 * Shared TypeScript types for Convex functions
 * These provide proper typing for common patterns used across the codebase
 */

import type { Id, Doc, TableNames } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

// Re-export context types for convenience
export type { QueryCtx, MutationCtx, ActionCtx };

// User with organization membership info
export interface UserWithMembership {
  user: Doc<"users">;
  membership: Doc<"organizationMembers">;
}

// Organization member roles
export type OrganizationRole = "owner" | "admin" | "editor" | "viewer";

// Agent with organization info (as returned by getAgentsForUser)
export interface AgentWithOrganization extends Doc<"agents"> {
  organization: {
    id: Id<"organizations">;
    userRole: OrganizationRole;
  };
}

// Subscription with plan info
export interface SubscriptionWithPlan {
  subscription: Doc<"subscriptions">;
  plan: Doc<"subscriptionPlans"> | null;
}

// Message format for conversation history
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Partial update types for common tables
export type AgentUpdate = Partial<Pick<Doc<"agents">, 
  "name" | "description" | "instructions" | "model" | 
  "allowedDomains" | "widgetSecretKey" | "domainVerificationEnabled"
>>;

export type UserUpdate = Partial<Pick<Doc<"users">,
  "name" | "email" | "imageUrl"
>>;

// Feature gate check result
export interface FeatureCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

// Email notification types
export type EmailType = 
  | "welcome"
  | "billing_notification"
  | "usage_alert"
  | "general_notification"
  | "organization_invitation";

export interface EmailArgs {
  type: EmailType;
  to: string;
  subject: string;
  [key: string]: unknown;
}

// Stripe webhook event types
export type StripeEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed";

// Helper type for query index builder
export type IndexQueryBuilder<T extends TableNames> = {
  eq: (field: string, value: unknown) => IndexQueryBuilder<T>;
};

// Usage tracking metrics
export type UsageMetric = 
  | "messages"
  | "agents" 
  | "knowledgeEntries"
  | "storage"
  | "conversations";
