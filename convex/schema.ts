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
    content: v.string(),
    source: v.string(), // "text", "document", "url"
    sourceMetadata: v.optional(v.object({
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      chunkIndex: v.optional(v.number()),
    })),
    embeddings: v.optional(v.array(v.number())),
  }).index("agentId", ["agentId"]),
  
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
})
