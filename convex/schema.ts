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
})
