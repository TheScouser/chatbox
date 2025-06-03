import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    clerkId: v.string(),
  }).index("clerkId", ["clerkId"]),
  
  agents: defineTable({
    userId: v.id("users"),
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
  }).index("userId", ["userId"]),
  
  knowledgeEntries: defineTable({
    agentId: v.id("agents"),
    title: v.optional(v.string()),
    content: v.string(),
    source: v.string(), // "text", "document", "url"
    sourceMetadata: v.optional(v.object({
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      chunkIndex: v.optional(v.number()),
      totalChunks: v.optional(v.number()),
    })),
    embedding: v.optional(v.array(v.number())),
  }).index("agentId", ["agentId"])
    .vectorIndex("byEmbedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
  
  conversations: defineTable({
    agentId: v.id("agents"),
    title: v.optional(v.string()),
    isActive: v.boolean(),
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
  }).index("agentId", ["agentId"]),

  // Usage tracking and security monitoring
  usageTracking: defineTable({
    agentId: v.id("agents"),
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
  }).index("agentId", ["agentId"])
    .index("ipAddress", ["ipAddress"])
    .index("domain", ["domain"])
    .index("lastActivity", ["lastActivity"]),

  // Rate limiting tracking
  rateLimits: defineTable({
    agentId: v.id("agents"),
    ipAddress: v.string(),
    requestCount: v.number(),
    windowStart: v.number(), // timestamp of rate limit window start
    windowType: v.union(v.literal("minute"), v.literal("hour"), v.literal("day")),
    isBlocked: v.optional(v.boolean()),
    blockExpiry: v.optional(v.number()), // timestamp when block expires
  }).index("agentId_ip", ["agentId", "ipAddress"])
    .index("windowStart", ["windowStart"]),

  // Security incidents
  securityIncidents: defineTable({
    agentId: v.id("agents"),
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
  }).index("agentId", ["agentId"])
    .index("incidentType", ["incidentType"])
    .index("severity", ["severity"]),
})
