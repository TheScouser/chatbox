import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
  }).index("clerkId", ["clerkId"]),
  
  // Organizations table
  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // unique identifier for the organization
    description: v.optional(v.string()),
    plan: v.optional(v.string()), // "free", "pro", "enterprise", etc.
    settings: v.optional(v.object({
      allowedDomains: v.optional(v.array(v.string())),
      requireEmailVerification: v.optional(v.boolean()),
      defaultMemberRole: v.optional(v.string()),
      enableAuditLogs: v.optional(v.boolean()),
    })),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("slug", ["slug"]),

  // Organization membership table with roles
  organizationMembers: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    role: v.union(
      v.literal("owner"),    // Full access, can delete org
      v.literal("admin"),    // Can manage members and settings
      v.literal("editor"),   // Can create/edit agents and content
      v.literal("viewer")    // Read-only access
    ),
    invitedBy: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    joinedAt: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("suspended")
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("userId", ["userId"])
    .index("organizationId", ["organizationId"])
    .index("userId_organizationId", ["userId", "organizationId"]),

  // Team invitations
  organizationInvitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("editor"), 
      v.literal("viewer")
    ),
    invitedBy: v.id("users"),
    token: v.string(), // unique invitation token
    expiresAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked")
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("email", ["email"])
    .index("token", ["token"])
    .index("organizationId", ["organizationId"]),
  
  agents: defineTable({
    organizationId: v.id("organizations"),
    createdBy: v.id("users"), // Track who created the agent
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    model: v.optional(v.string()),
    allowedDomains: v.optional(v.array(v.string())),
    widgetSecretKey: v.optional(v.string()),
    domainVerificationEnabled: v.optional(v.boolean()),
    rateLimitPerMinute: v.optional(v.number()),
    rateLimitPerDay: v.optional(v.number()),
    requireAuthentication: v.optional(v.boolean()),
    allowedIPs: v.optional(v.array(v.string())),
    blockedIPs: v.optional(v.array(v.string())),
    maxSessionDuration: v.optional(v.number()),
    enableUsageTracking: v.optional(v.boolean()),
    monthlyMessageLimit: v.optional(v.number()),
    enableReferrerCheck: v.optional(v.boolean()),
    customCorsOrigins: v.optional(v.array(v.string())),
    enableFingerprinting: v.optional(v.boolean()),
    suspiciousActivityThreshold: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("organizationId", ["organizationId"])
    .index("createdBy", ["createdBy"]),
  
  knowledgeEntries: defineTable({
    agentId: v.id("agents"),
    title: v.optional(v.string()),
    content: v.string(),
    source: v.union(
      v.literal("text"),
      v.literal("document"),
      v.literal("url"),
      v.literal("qna"),
    ),
    sourceMetadata: v.optional(v.object({
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      chunkIndex: v.optional(v.number()),
      totalChunks: v.optional(v.number()),
      fileId: v.optional(v.id("files")),
      fileSize: v.optional(v.number()),
      status: v.optional(v.string()),
    })),
    embedding: v.optional(v.array(v.number())),
    fileId: v.optional(v.id("files")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId", ["agentId"])
    .vectorIndex("byEmbedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
  
  conversations: defineTable({
    agentId: v.id("agents"),
    title: v.optional(v.string()),
    isActive: v.boolean(),
    channelType: v.optional(v.union(
      v.literal("widget"),
      v.literal("whatsapp"),
      v.literal("web"),
      v.literal("fb"),
    )),
    status: v.union(
      v.literal("open"),
      v.literal("waiting"),
      v.literal("resolved"),
      v.literal("handover"),
    ),
    locale: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId", ["agentId"]),
  
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.object({
      userId: v.optional(v.string()), // For user messages
      model: v.optional(v.string()), // For assistant messages
      tokensUsed: v.optional(v.number()),
      knowledgeUsed: v.optional(v.number()), // Number of knowledge sources used
      error: v.optional(v.string()), // Error message if response failed
    })),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("conversationId", ["conversationId"]),
  
  files: defineTable({
    storageId: v.id("_storage"),
    agentId: v.id("agents"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"), 
      v.literal("processed"),
      v.literal("error")
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId", ["agentId"]),

  // Usage tracking and security monitoring - updated to include organizationId
  usageTracking: defineTable({
    agentId: v.id("agents"),
    organizationId: v.id("organizations"), // Added for organization tracking
    ipAddress: v.string(),
    domain: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    fingerprint: v.optional(v.string()),
    messageCount: v.number(),
    tokensUsed: v.optional(v.number()),
    sessionId: v.optional(v.string()),
    isBlocked: v.optional(v.boolean()),
    suspiciousActivity: v.optional(v.boolean()),
    lastActivity: v.number(), // timestamp
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId", ["agentId"])
    .index("organizationId", ["organizationId"])
    .index("ipAddress", ["ipAddress"])
    .index("domain", ["domain"])
    .index("lastActivity", ["lastActivity"]),

  // Rate limiting tracking - updated to include organizationId
  rateLimits: defineTable({
    agentId: v.id("agents"),
    organizationId: v.id("organizations"), // Added for organization tracking
    ipAddress: v.string(),
    requestCount: v.number(),
    windowStart: v.number(), // timestamp of rate limit window start
    windowType: v.union(v.literal("minute"), v.literal("hour"), v.literal("day")),
    isBlocked: v.optional(v.boolean()),
    blockExpiry: v.optional(v.number()), // timestamp when block expires
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId_ip", ["agentId", "ipAddress"])
    .index("organizationId", ["organizationId"])
    .index("windowStart", ["windowStart"]),

  // Security incidents - updated to include organizationId
  securityIncidents: defineTable({
    agentId: v.id("agents"),
    organizationId: v.id("organizations"), // Added for organization tracking
    incidentType: v.union(
      v.literal("rate_limit_exceeded"),
      v.literal("unauthorized_domain"),
      v.literal("invalid_signature"),
      v.literal("suspicious_activity"),
      v.literal("blocked_ip"),
      v.literal("referrer_mismatch")
    ),
    ipAddress: v.string(),
    domain: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.string()),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    resolved: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("agentId", ["agentId"])
    .index("organizationId", ["organizationId"])
    .index("incidentType", ["incidentType"])
    .index("severity", ["severity"]),

  // Updated subscription tables to work with organizations instead of users
  subscriptionPlans: defineTable({
    name: v.string(),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
    price: v.number(), // price in cents
    interval: v.union(v.literal("month"), v.literal("year")),
    features: v.object({
      // Monthly usage limits
      aiCredits: v.number(),              // AI message credits per month
      knowledgeCharacters: v.number(),    // Total KB characters allowed
      emailCredits: v.number(),           // Email notifications per month
      
      // Entity limits (not monthly, total allowed)
      maxChatbots: v.number(),            // Number of agents/chatbots
      maxSeats: v.number(),               // Team members
      maxAiActionsPerAgent: v.number(),   // AI actions per agent
      
      // Optional limits (0 = not available on plan)
      voiceMinutes: v.number(),           // Voice input minutes per month
      resyncCredits: v.number(),          // Knowledge base resync credits
      maxFileSizeMB: v.number(),          // Max single file size
      
      // Feature flags
      prioritySupport: v.boolean(),
      customDomains: v.boolean(),
      advancedAnalytics: v.boolean(),
      apiAccess: v.boolean(),
      webhookIntegrations: v.boolean(),
      customBranding: v.boolean(),        // Hide "Powered by" badge
      exportChats: v.boolean(),
      exportLeads: v.boolean(),
      downloadTranscripts: v.boolean(),
    }),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("stripeProductId", ["stripeProductId"]),

  // Updated subscriptions to belong to organizations
  subscriptions: defineTable({
    organizationId: v.id("organizations"), // Changed from userId to organizationId
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    planId: v.id("subscriptionPlans"),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("unpaid"),
      v.literal("incomplete")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("organizationId", ["organizationId"])
    .index("stripeCustomerId", ["stripeCustomerId"])
    .index("stripeSubscriptionId", ["stripeSubscriptionId"]),

  // Updated billing usage to track per organization
  billingUsage: defineTable({
    organizationId: v.id("organizations"), // Changed from userId to organizationId
    period: v.string(), // YYYY-MM format
    metrics: v.object({
      aiCreditsUsed: v.number(),
      knowledgeCharactersUsed: v.number(),
      emailCreditsUsed: v.number(),
      voiceMinutesUsed: v.number(),
      resyncCreditsUsed: v.number(),
    }),
    lastUpdated: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("organizationId_period", ["organizationId", "period"]),

  // Audit logs for organization activities
  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"), // Who performed the action
    action: v.string(), // e.g., "agent.created", "member.invited", "settings.updated"
    resourceType: v.optional(v.string()), // e.g., "agent", "user", "organization"
    resourceId: v.optional(v.string()), // ID of the affected resource
    details: v.optional(v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
      metadata: v.optional(v.any()),
    })),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("organizationId", ["organizationId"])
    .index("userId", ["userId"])
    .index("action", ["action"])
    .index("resourceType", ["resourceType"]),
})
