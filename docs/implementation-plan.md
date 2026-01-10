# Chatbox Feature Expansion - Implementation Plan

> **Purpose**: This document provides detailed, self-contained implementation tasks for AI agents. Each task should fit within a single context window and be implementable independently (respecting dependencies).

---

## Overview

Implement three major features in priority order:

1. **Phase 1: Credits System** - Chatling-style usage tracking with separate limits for AI credits, knowledge base characters, chatbots, seats, etc.
2. **Phase 2: Widget Designer** - Per-agent widget configurations stored in database with visual designer UI
3. **Phase 3: Multi-Language Support** - Translatable widget texts and AI responses in user's preferred language

---

## Current State Analysis

### What Exists
- `subscriptionPlans` table with basic features object
- `billingUsage` table tracking metrics per organization/period
- `featureGates.ts` with `checkUsageLimit` and `trackUsage` functions
- `ChatWidget.tsx` and `ChatBubbleWidget.tsx` for display
- `ChatInterfaceSettings.tsx` with frontend-only state (not persisted)

### Critical Issues
1. **Credits not tracked**: `chat.ts` never calls `trackUsage` - usage is not being recorded
2. **No widget persistence**: Widget settings are useState only, lost on refresh
3. **No greeting messages**: Initial messages don't exist in schema or UI
4. **No translations**: Single language only

---

## Phase 1: Credits System

### Task 1.1: Schema Updates for Credits

**File to modify**: `convex/schema.ts`

**What to do**:

1. Replace the `features` object in `subscriptionPlans` table with:

```typescript
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
```

2. Replace the `metrics` object in `billingUsage` table with:

```typescript
metrics: v.object({
  aiCreditsUsed: v.number(),
  knowledgeCharactersUsed: v.number(),
  emailCreditsUsed: v.number(),
  voiceMinutesUsed: v.number(),
  resyncCreditsUsed: v.number(),
}),
```

**Acceptance criteria**:
- Schema compiles without errors
- Existing queries still work (may need migration)

---

### Task 1.2: Create Usage Tracking Service

**File to create**: `convex/usageService.ts`

**What to do**: Create a centralized service for all usage tracking with these functions:

```typescript
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ============ QUERIES ============

// Check if AI credit is available (call before generating response)
export const checkAiCreditAvailable = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // 1. Get current period (YYYY-MM)
    // 2. Get organization's plan limits (or free plan defaults)
    // 3. Get current usage from billingUsage
    // 4. Return { allowed: boolean, current: number, limit: number, remaining: number }
  },
});

// Check if knowledge characters can be added
export const checkKnowledgeCharactersAvailable = internalQuery({
  args: { 
    organizationId: v.id("organizations"),
    additionalChars: v.number(),
  },
  handler: async (ctx, args) => {
    // Similar to above but for knowledge characters
    // Note: This is TOTAL, not monthly - sum all knowledge entries
  },
});

// Check if can create another chatbot
export const checkChatbotLimitAvailable = internalQuery({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Count current agents, compare to maxChatbots
  },
});

// Get full usage summary for dashboard
export const getUsageSummary = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Return all metrics with current/limit for each:
    // - aiCredits
    // - knowledgeCharacters  
    // - emailCredits
    // - chatbots
    // - seats
    // Include percentUsed for progress bars
  },
});

// ============ MUTATIONS ============

// Track AI credit usage (call after successful response)
export const trackAiCredit = internalMutation({
  args: { 
    organizationId: v.id("organizations"),
    creditsUsed: v.number(), // Usually 1, could be more for complex ops
  },
  handler: async (ctx, args) => {
    // 1. Get or create billingUsage for current period
    // 2. Increment aiCreditsUsed
    // 3. Check if should send usage alert (75%, 90%)
  },
});

// Track knowledge character usage
export const trackKnowledgeCharacters = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    characters: v.number(),
    operation: v.union(v.literal("add"), v.literal("remove")),
  },
  handler: async (ctx, args) => {
    // Add or subtract from knowledgeCharactersUsed
  },
});

// Track email credit usage
export const trackEmailCredit = internalMutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Increment emailCreditsUsed
  },
});
```

**Helper functions to include**:

```typescript
function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getFreePlanLimits() {
  return {
    aiCredits: 100,
    knowledgeCharacters: 500000,
    emailCredits: 25,
    maxChatbots: 2,
    maxSeats: 1,
    maxAiActionsPerAgent: 1,
    voiceMinutes: 0,
    resyncCredits: 0,
    maxFileSizeMB: 1,
    prioritySupport: false,
    customDomains: false,
    advancedAnalytics: false,
    apiAccess: false,
    webhookIntegrations: false,
    customBranding: false,
    exportChats: false,
    exportLeads: false,
    downloadTranscripts: false,
  };
}
```

**Acceptance criteria**:
- All functions compile
- `getUsageSummary` returns correct structure
- Internal functions properly update billingUsage

---

### Task 1.3: Integrate Credits into Chat Flow

**File to modify**: `convex/chat.ts`

**What to do**: Update `generateAIResponse` action to check and track credits.

**Changes**:

1. At the START of the handler (after getting agent):

```typescript
// Check AI credit availability
const creditCheck = await ctx.runQuery(internal.usageService.checkAiCreditAvailable, {
  organizationId: agent.organizationId,
});

if (!creditCheck.allowed) {
  throw new Error(
    `AI credit limit reached for this month. ` +
    `Used: ${creditCheck.current}/${creditCheck.limit}. ` +
    `Please upgrade your plan or wait until next month.`
  );
}
```

2. AFTER successful AI response generation (before return):

```typescript
// Track credit usage
await ctx.runMutation(internal.usageService.trackAiCredit, {
  organizationId: agent.organizationId,
  creditsUsed: 1, // or calculate based on tokens if desired
});
```

3. Add import at top:

```typescript
import { internal } from "./_generated/api";
```

**Acceptance criteria**:
- Chat fails gracefully when credits exhausted
- Credit is tracked after each successful response
- Error message is user-friendly

---

### Task 1.4: Integrate Credits into Knowledge Base

**Files to modify**: `convex/knowledge.ts`

**What to do**: Track character count when adding/removing knowledge entries.

**For addKnowledgeEntry or similar mutation**:

1. Before inserting:

```typescript
const charCount = args.content.length;

const charCheck = await ctx.runQuery(internal.usageService.checkKnowledgeCharactersAvailable, {
  organizationId: agent.organizationId,
  additionalChars: charCount,
});

if (!charCheck.allowed) {
  throw new Error(
    `Knowledge base character limit reached. ` +
    `Current: ${charCheck.current.toLocaleString()}/${charCheck.limit.toLocaleString()}. ` +
    `This entry has ${charCount.toLocaleString()} characters. ` +
    `Please upgrade your plan or remove existing entries.`
  );
}
```

2. After successful insert:

```typescript
await ctx.runMutation(internal.usageService.trackKnowledgeCharacters, {
  organizationId: agent.organizationId,
  characters: charCount,
  operation: "add",
});
```

**For deleteKnowledgeEntry**:

```typescript
// Get entry before deletion to know character count
const entry = await ctx.db.get(args.entryId);
if (entry) {
  const charCount = entry.content.length;
  
  // Delete entry
  await ctx.db.delete(args.entryId);
  
  // Track removal
  await ctx.runMutation(internal.usageService.trackKnowledgeCharacters, {
    organizationId: agent.organizationId,
    characters: charCount,
    operation: "remove",
  });
}
```

**Acceptance criteria**:
- Cannot add knowledge entry if it would exceed limit
- Character count updates on add/remove
- Error messages are helpful

---

### Task 1.5: Update Seed Plans

**File to modify**: `convex/seedPlans.ts`

**What to do**: Update to create Chatling-style plans.

**Plan configurations** (based on Chatling screenshots):

```typescript
const plans = [
  {
    name: "Free",
    stripeProductId: "prod_free",
    stripePriceId: "price_free",
    price: 0,
    interval: "month" as const,
    features: {
      aiCredits: 100,
      knowledgeCharacters: 500000,        // 500K
      emailCredits: 25,
      maxChatbots: 2,
      maxSeats: 1,
      maxAiActionsPerAgent: 1,
      voiceMinutes: 0,
      resyncCredits: 0,
      maxFileSizeMB: 1,
      prioritySupport: false,
      customDomains: false,
      advancedAnalytics: false,
      apiAccess: false,
      webhookIntegrations: false,
      customBranding: false,
      exportChats: false,
      exportLeads: false,
      downloadTranscripts: false,
    },
    isActive: true,
    sortOrder: 0,
  },
  {
    name: "Starter",
    stripeProductId: "prod_starter",
    stripePriceId: "price_starter_monthly",
    price: 2900, // $29.00 in cents
    interval: "month" as const,
    features: {
      aiCredits: 3000,
      knowledgeCharacters: 20000000,      // 20M
      emailCredits: 1500,
      maxChatbots: 5,
      maxSeats: 2,
      maxAiActionsPerAgent: 3,
      voiceMinutes: 400,
      resyncCredits: 10000,
      maxFileSizeMB: 25,
      prioritySupport: false,
      customDomains: false,
      advancedAnalytics: true,
      apiAccess: true,
      webhookIntegrations: true,
      customBranding: false,
      exportChats: true,
      exportLeads: true,
      downloadTranscripts: false,
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Ultimate",
    stripeProductId: "prod_ultimate",
    stripePriceId: "price_ultimate_monthly",
    price: 9900, // $99.00 in cents
    interval: "month" as const,
    features: {
      aiCredits: 12000,
      knowledgeCharacters: 90000000,      // 90M
      emailCredits: 10000,
      maxChatbots: 35,
      maxSeats: 6,
      maxAiActionsPerAgent: 6,
      voiceMinutes: 1500,
      resyncCredits: 50000,
      maxFileSizeMB: 100,
      prioritySupport: true,
      customDomains: true,
      advancedAnalytics: true,
      apiAccess: true,
      webhookIntegrations: true,
      customBranding: true,
      exportChats: true,
      exportLeads: true,
      downloadTranscripts: true,
    },
    isActive: true,
    sortOrder: 2,
  },
];
```

**Acceptance criteria**:
- Running seed creates all three plans
- Plan limits match Chatling pricing table

---

### Task 1.6: Usage Dashboard UI Updates

**Files to modify**: 
- `src/routes/dashboard.usage.tsx`
- `src/components/usage/UsageOverviewCards.tsx`

**What to do**: Update to show all credit types.

**UsageOverviewCards changes**:

Display cards for:
1. **AI Credits**: `X of Y used` with progress bar
2. **Knowledge Base**: `X of Y characters` with progress bar
3. **Email Credits**: `X of Y used` with progress bar
4. **Chatbots**: `X of Y` with progress bar
5. **Seats**: `X of Y` with progress bar

Each card should:
- Show current/limit as text
- Show percentage progress bar
- Color code: green (<50%), yellow (50-75%), orange (75-90%), red (>90%)
- Show "Upgrade" button if at limit

**Data fetching**:

```typescript
const usageSummary = useQuery(api.usageService.getUsageSummary, {
  organizationId: currentOrganizationId,
});
```

**Acceptance criteria**:
- All credit types displayed
- Progress bars accurate
- Visual warning at high usage

---

## Phase 2: Widget Designer

### Task 2.1: Widget Configuration Schema

**File to modify**: `convex/schema.ts`

**What to do**: Add two new tables for widget configuration.

**Table 1: widgetConfigurations**

```typescript
widgetConfigurations: defineTable({
  agentId: v.id("agents"),
  name: v.string(),                    // "Main Widget", "Support Widget"
  isDefault: v.boolean(),              // Default widget for this agent
  
  // Branding settings
  branding: v.object({
    logoStorageId: v.optional(v.id("_storage")),
    primaryColor: v.string(),          // Hex color, default "#2563eb"
    foregroundColor: v.string(),       // Text/icon color, default "#ffffff"
    showHeaderIcon: v.boolean(),
    headerIconCircular: v.boolean(),
    botAvatarCircular: v.boolean(),
    botAvatarType: v.union(v.literal("logo"), v.literal("custom")),
    botAvatarStorageId: v.optional(v.id("_storage")),
  }),
  
  // Interface/position settings
  interface: v.object({
    position: v.union(v.literal("bottom-right"), v.literal("bottom-left")),
    offsetX: v.number(),               // Pixels from edge
    offsetY: v.number(),
    width: v.number(),                 // Widget width in pixels
    height: v.number(),                // Widget height in pixels
  }),
  
  // AI settings for this widget specifically
  aiSettings: v.object({
    model: v.string(),                 // "gpt-4o-mini", "gpt-4o", etc.
    temperature: v.number(),           // 0.0 to 1.0
    maxTokens: v.number(),             // Max response tokens
  }),
  
  // Behavior configuration
  config: v.object({
    hidePoweredBy: v.boolean(),
    showRating: v.boolean(),
    allowTranscriptDownload: v.boolean(),
    voiceInputEnabled: v.boolean(),
    voiceMaxDuration: v.number(),      // Seconds, default 60
    showAiSources: v.boolean(),
    hoveringMessageDesktop: v.boolean(),
    hoveringMessageMobile: v.boolean(),
    autoOpenChat: v.boolean(),
    autoOpenDelay: v.number(),         // Seconds
  }),
  
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("agentId", ["agentId"]),
```

**Table 2: widgetTexts**

```typescript
widgetTexts: defineTable({
  widgetConfigId: v.id("widgetConfigurations"),
  locale: v.string(),                  // "en", "es", "fr", "cs", etc.
  isDefault: v.boolean(),              // Fallback locale for this widget
  
  texts: v.object({
    headerTitle: v.string(),           // "Support Agent"
    inputPlaceholder: v.string(),      // "Type here..."
    greetingMessages: v.array(v.object({
      type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
      content: v.string(),             // Text content or URL for media
    })),
    quickReplies: v.array(v.string()), // ["Pricing", "Support", "Demo"]
    footerText: v.optional(v.string()),
    offlineMessage: v.optional(v.string()),
  }),
  
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("widgetConfigId", ["widgetConfigId"])
  .index("widgetConfigId_locale", ["widgetConfigId", "locale"]),
```

**Acceptance criteria**:
- Schema compiles
- Tables created on deploy

---

### Task 2.2: Widget Configuration CRUD

**File to create**: `convex/widgetConfig.ts`

**Functions to implement**:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all widget configs for an agent
export const getWidgetConfigsForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    // Validate user has access to agent's organization
    // Return all widget configs with their default locale texts
  },
});

// Get single widget config with all locale texts
export const getWidgetConfigById = query({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get config + all associated widgetTexts
  },
});

// Get widget config for embed (public, no auth required)
export const getWidgetConfigForEmbed = query({
  args: { 
    agentId: v.id("agents"),
    widgetId: v.optional(v.id("widgetConfigurations")),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If widgetId provided, use that; otherwise use default
    // Get texts for requested locale or fallback to default
    // Return combined config + texts
  },
});

// Create new widget configuration
export const createWidgetConfig = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    // ... all branding, interface, aiSettings, config fields with defaults
  },
  handler: async (ctx, args) => {
    // Validate user has editor access
    // Check chatbot limit (counts widgets too? or separate limit?)
    // Create with sensible defaults
    // Create default English texts
    // Return widget config ID
  },
});

// Update widget configuration
export const updateWidgetConfig = mutation({
  args: {
    widgetConfigId: v.id("widgetConfigurations"),
    name: v.optional(v.string()),
    branding: v.optional(v.object({...})),
    interface: v.optional(v.object({...})),
    aiSettings: v.optional(v.object({...})),
    config: v.optional(v.object({...})),
  },
  handler: async (ctx, args) => {
    // Validate access
    // Patch only provided fields
    // Update updatedAt
  },
});

// Delete widget configuration
export const deleteWidgetConfig = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Validate access
    // Delete all associated widgetTexts first
    // Delete widget config
  },
});

// Duplicate widget configuration
export const duplicateWidgetConfig = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get existing config + texts
    // Create copy with name "(Copy)"
    // Copy all texts
    // Return new ID
  },
});

// Set as default widget for agent
export const setDefaultWidget = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Unset isDefault on all other widgets for same agent
    // Set isDefault on this widget
  },
});
```

**Default values for new widget**:

```typescript
const defaultBranding = {
  primaryColor: "#2563eb",
  foregroundColor: "#ffffff",
  showHeaderIcon: true,
  headerIconCircular: true,
  botAvatarCircular: true,
  botAvatarType: "logo" as const,
};

const defaultInterface = {
  position: "bottom-right" as const,
  offsetX: 20,
  offsetY: 20,
  width: 350,
  height: 500,
};

const defaultAiSettings = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 500,
};

const defaultConfig = {
  hidePoweredBy: false,
  showRating: false,
  allowTranscriptDownload: false,
  voiceInputEnabled: false,
  voiceMaxDuration: 60,
  showAiSources: false,
  hoveringMessageDesktop: false,
  hoveringMessageMobile: false,
  autoOpenChat: false,
  autoOpenDelay: 3,
};

const defaultTexts = {
  headerTitle: "Support Agent",
  inputPlaceholder: "Type here...",
  greetingMessages: [
    { type: "text" as const, content: "Hi there! How can I assist you?" }
  ],
  quickReplies: [],
  footerText: "",
  offlineMessage: "We're currently offline. Please leave a message.",
};
```

**Acceptance criteria**:
- All CRUD operations work
- Access control enforced
- Defaults applied correctly

---

### Task 2.3: Widget Texts CRUD

**File to create**: `convex/widgetTexts.ts`

**Functions to implement**:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all texts for a widget (all locales)
export const getWidgetTexts = query({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Validate access via widget -> agent -> organization
    // Return all locale texts
  },
});

// Get texts for specific locale
export const getWidgetTextsByLocale = query({
  args: { 
    widgetConfigId: v.id("widgetConfigurations"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Return texts for locale, or default if not found
  },
});

// Create or update texts for a locale
export const upsertWidgetTexts = mutation({
  args: {
    widgetConfigId: v.id("widgetConfigurations"),
    locale: v.string(),
    isDefault: v.optional(v.boolean()),
    texts: v.object({
      headerTitle: v.string(),
      inputPlaceholder: v.string(),
      greetingMessages: v.array(v.object({
        type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
        content: v.string(),
      })),
      quickReplies: v.array(v.string()),
      footerText: v.optional(v.string()),
      offlineMessage: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Validate access
    // Check if texts exist for this locale
    // If isDefault=true, unset other defaults
    // Insert or update
  },
});

// Delete texts for a locale (cannot delete default)
export const deleteWidgetTexts = mutation({
  args: { 
    widgetConfigId: v.id("widgetConfigurations"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate access
    // Check not deleting default locale
    // Delete
  },
});
```

**Acceptance criteria**:
- Can add/update/delete translations
- Cannot delete default locale
- Only one default per widget

---

### Task 2.4: Widget Designer Route

**File to create**: `src/routes/dashboard.agents.$agentId.widget.tsx`

**What to do**: Create the main widget designer page.

**Structure**:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
// Import tab components (to be created)

export const Route = createFileRoute("/dashboard/agents/$agentId/widget")({
  component: WidgetDesigner,
});

function WidgetDesigner() {
  const { agentId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<"branding" | "interface" | "texts" | "configure">("branding");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  
  // Local state for unsaved changes
  const [localConfig, setLocalConfig] = useState<WidgetConfig | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Fetch widgets for agent
  const widgets = useQuery(api.widgetConfig.getWidgetConfigsForAgent, { 
    agentId: agentId as Id<"agents"> 
  });
  
  // Mutations
  const updateConfig = useMutation(api.widgetConfig.updateWidgetConfig);
  const createConfig = useMutation(api.widgetConfig.createWidgetConfig);
  
  // ... handlers
  
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Panel - Settings */}
      <div className="w-[400px] border-r flex flex-col">
        {/* Header with Back, Widget selector, Save button */}
        <div className="p-4 border-b flex items-center justify-between">
          <button>← Back</button>
          <select>{/* Widget selector */}</select>
          <button disabled={!isDirty}>Save</button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <TabButton active={activeTab === "branding"} onClick={() => setActiveTab("branding")}>
            <BrushIcon /> Branding
          </TabButton>
          <TabButton active={activeTab === "interface"} onClick={() => setActiveTab("interface")}>
            <LayoutIcon /> Interface
          </TabButton>
          <TabButton active={activeTab === "texts"} onClick={() => setActiveTab("texts")}>
            <TypeIcon /> Texts
          </TabButton>
          <TabButton active={activeTab === "configure"} onClick={() => setActiveTab("configure")}>
            <SettingsIcon /> Configure
          </TabButton>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "branding" && <BrandingTab config={localConfig} onChange={handleConfigChange} />}
          {activeTab === "interface" && <InterfaceTab config={localConfig} onChange={handleConfigChange} />}
          {activeTab === "texts" && <TextsTab config={localConfig} onChange={handleConfigChange} />}
          {activeTab === "configure" && <ConfigureTab config={localConfig} onChange={handleConfigChange} />}
        </div>
      </div>
      
      {/* Right Panel - Preview */}
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <div className="text-center mb-4">
          <h3>Chatbot Preview</h3>
        </div>
        <WidgetPreview config={localConfig} />
      </div>
    </div>
  );
}
```

**Acceptance criteria**:
- Route accessible at /dashboard/agents/:agentId/widget
- Tab navigation works
- Widget selector shows all widgets
- Save button enabled when dirty

---

### Task 2.5: Widget Designer - Branding Tab

**File to create**: `src/components/widget-designer/BrandingTab.tsx`

**Form fields to include**:

1. **Logo** - File upload with drag & drop
   - Label: "Logo"
   - Helper: "Recommended size: 200x200px"
   - Supported: JPG/PNG/WEBP/GIF (max 1MB)
   
2. **Colors** section
   - Primary color (color picker + hex input)
   - Foreground color (color picker + hex input)
   
3. **Header Icon** section
   - Toggle: "Show icon"
   - Toggle: "Circular shape"
   
4. **Bot Avatar** section
   - Toggle: "Circular shape"
   - Radio: "Logo" / "Custom"
   - File upload for custom (when selected)

**Component structure**:

```typescript
interface BrandingTabProps {
  config: WidgetConfig;
  onChange: (updates: Partial<WidgetConfig>) => void;
}

export function BrandingTab({ config, onChange }: BrandingTabProps) {
  const handleLogoUpload = async (file: File) => {
    // Upload to Convex storage
    // Update config.branding.logoStorageId
  };
  
  return (
    <div className="space-y-6">
      {/* Logo section */}
      <FormSection title="Logo">
        <FileDropzone 
          accept="image/*"
          maxSize={1024 * 1024}
          onUpload={handleLogoUpload}
          preview={config.branding.logoStorageId}
        />
        <p className="text-xs text-muted-foreground">
          Recommended size: 200x200px<br/>
          Supported: JPG/PNG/WEBP/GIF (max 1MB)
        </p>
      </FormSection>
      
      {/* Colors section */}
      <FormSection title="Colors">
        <div className="space-y-4">
          <ColorPicker 
            label="Primary color"
            value={config.branding.primaryColor}
            onChange={(color) => onChange({ 
              branding: { ...config.branding, primaryColor: color } 
            })}
          />
          <ColorPicker 
            label="Foreground color"
            description="Texts, icons, and other visual elements"
            value={config.branding.foregroundColor}
            onChange={(color) => onChange({ 
              branding: { ...config.branding, foregroundColor: color } 
            })}
          />
        </div>
      </FormSection>
      
      {/* Header Icon section */}
      <FormSection title="Header Icon">
        <ToggleRow 
          label="Show icon" 
          checked={config.branding.showHeaderIcon}
          onChange={(v) => onChange({ branding: { ...config.branding, showHeaderIcon: v } })}
        />
        <ToggleRow 
          label="Circular shape" 
          checked={config.branding.headerIconCircular}
          onChange={(v) => onChange({ branding: { ...config.branding, headerIconCircular: v } })}
        />
      </FormSection>
      
      {/* Bot Avatar section */}
      <FormSection title="Bot Avatar">
        <ToggleRow 
          label="Circular shape" 
          checked={config.branding.botAvatarCircular}
          onChange={(v) => onChange({ branding: { ...config.branding, botAvatarCircular: v } })}
        />
        <div className="flex mt-4">
          <RadioGroup value={config.branding.botAvatarType} onChange={(v) => ...}>
            <RadioOption value="logo">Logo</RadioOption>
            <RadioOption value="custom">Custom</RadioOption>
          </RadioGroup>
        </div>
        {config.branding.botAvatarType === "custom" && (
          <FileDropzone onUpload={handleAvatarUpload} preview={...} />
        )}
      </FormSection>
    </div>
  );
}
```

**Acceptance criteria**:
- All form fields render
- Changes propagate to parent
- File uploads work
- Color pickers work

---

### Task 2.6: Widget Designer - Interface Tab

**File to create**: `src/components/widget-designer/InterfaceTab.tsx`

**Form fields**:

1. **Position** - Select: "Bottom Right" / "Bottom Left"
2. **Offset X** - Number input or slider (0-100px)
3. **Offset Y** - Number input or slider (0-100px)
4. **Width** - Select: 300px, 350px, 400px, 450px
5. **Height** - Select: 400px, 450px, 500px, 550px, 600px

---

### Task 2.7: Widget Designer - Texts Tab

**File to create**: `src/components/widget-designer/TextsTab.tsx`

**This is the most complex tab.** Includes:

1. **Header Title** - Text input
2. **Greeting Message** section
   - Type selector dropdown (Text/Image/Video)
   - Rich text editor for content (or URL input for media)
   - Character counter (e.g., 31/500)
   - Sortable list for multiple messages
   - "+ Add message" button
   
3. **Quick Replies** section
   - Toggle: "Auto-hide quick replies"
   - List of quick reply chips
   - "+ Add quick reply" button
   
4. **Footer** - Text input

5. **Translations** section
   - List of configured languages with expand/collapse
   - Each expanded shows same fields as above for that locale
   - "+ Add Translation" button opens language selector modal

---

### Task 2.8: Widget Designer - Configure Tab

**File to create**: `src/components/widget-designer/ConfigureTab.tsx`

**Toggle switches with plan-gating**:

```typescript
export function ConfigureTab({ config, onChange, planFeatures }: ConfigureTabProps) {
  return (
    <div className="space-y-6">
      <FormSection title="General">
        <ToggleRow 
          label='Hide "Powered by Chatling" text'
          checked={config.config.hidePoweredBy}
          onChange={(v) => onChange({ config: { ...config.config, hidePoweredBy: v } })}
          disabled={!planFeatures.customBranding}
          upgradePrompt={!planFeatures.customBranding && "Upgrade plan to use this option"}
        />
        <ToggleRow 
          label="Display rating for AI responses"
          checked={config.config.showRating}
          onChange={(v) => onChange({ config: { ...config.config, showRating: v } })}
        />
        <ToggleRow 
          label="Allow users to download chat transcript"
          checked={config.config.allowTranscriptDownload}
          onChange={(v) => onChange({ config: { ...config.config, allowTranscriptDownload: v } })}
          disabled={!planFeatures.downloadTranscripts}
          upgradePrompt={!planFeatures.downloadTranscripts && "Upgrade plan to use this option"}
        />
      </FormSection>
      
      <FormSection title="Voice input">
        <p className="text-sm text-muted-foreground mb-4">
          Allows users to send messages by voice (speech-to-text). 
          Will count towards your speech-to-text usage limit.
        </p>
        <ToggleRow 
          label="Enable"
          checked={config.config.voiceInputEnabled}
          onChange={(v) => onChange({ config: { ...config.config, voiceInputEnabled: v } })}
        />
        <NumberInput
          label="Max duration"
          description="The maximum duration of a voice recording. Leave blank for default (60 seconds)."
          value={config.config.voiceMaxDuration}
          min={5}
          max={120}
          placeholder="5 - 120"
          onChange={(v) => onChange({ config: { ...config.config, voiceMaxDuration: v } })}
        />
      </FormSection>
      
      <FormSection title="AI response sources">
        <p className="text-sm text-muted-foreground mb-4">
          Displays the knowledge base sources used by the AI for its answers.
        </p>
        <ToggleRow 
          label="Enable"
          checked={config.config.showAiSources}
          onChange={(v) => onChange({ config: { ...config.config, showAiSources: v } })}
        />
      </FormSection>
      
      <FormSection title="Hovering Message">
        <p className="text-sm text-muted-foreground mb-4">
          Improve chatbot's engagement rate with attention-grabbing messages 
          that appear over the chat icon.
        </p>
        <ToggleRow 
          label="Enable on desktop"
          checked={config.config.hoveringMessageDesktop}
          onChange={(v) => onChange({ config: { ...config.config, hoveringMessageDesktop: v } })}
        />
        <ToggleRow 
          label="Enable on mobile"
          checked={config.config.hoveringMessageMobile}
          onChange={(v) => onChange({ config: { ...config.config, hoveringMessageMobile: v } })}
        />
      </FormSection>
      
      <FormSection title="Auto-open chat">
        <p className="text-sm text-muted-foreground mb-4">
          Automatically opens the chat when the user visits your website.
        </p>
        <ToggleRow 
          label="Enable"
          checked={config.config.autoOpenChat}
          onChange={(v) => onChange({ config: { ...config.config, autoOpenChat: v } })}
        />
        {config.config.autoOpenChat && (
          <NumberInput
            label="Delay (seconds)"
            value={config.config.autoOpenDelay}
            min={0}
            max={60}
            onChange={(v) => onChange({ config: { ...config.config, autoOpenDelay: v } })}
          />
        )}
      </FormSection>
    </div>
  );
}
```

---

### Task 2.9: Widget Preview Component

**File to create**: `src/components/widget-designer/WidgetPreview.tsx`

**What to do**: Create a live preview that updates in real-time.

```typescript
interface WidgetPreviewProps {
  config: WidgetConfig;
  texts: WidgetTexts;
}

export function WidgetPreview({ config, texts }: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="relative" style={{ width: config.interface.width, height: config.interface.height }}>
      {/* Closed state - bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-0 right-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: config.branding.primaryColor }}
        >
          <MessageSquare className="text-white" />
        </button>
      )}
      
      {/* Open state - chat window */}
      {isOpen && (
        <div 
          className="bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden"
          style={{ width: config.interface.width, height: config.interface.height }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ 
              backgroundColor: config.branding.primaryColor,
              color: config.branding.foregroundColor,
            }}
          >
            <div className="flex items-center gap-2">
              {config.branding.showHeaderIcon && (
                <div className={`w-8 h-8 bg-white/20 flex items-center justify-center ${
                  config.branding.headerIconCircular ? 'rounded-full' : 'rounded'
                }`}>
                  {/* Logo or icon */}
                </div>
              )}
              <span className="font-semibold">{texts.headerTitle}</span>
            </div>
            <div className="flex gap-2">
              <button className="p-1"><MoreHorizontal size={16} /></button>
              <button className="p-1" onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Greeting messages */}
            {texts.greetingMessages.map((msg, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <div className={`w-6 h-6 bg-gray-200 flex items-center justify-center ${
                  config.branding.botAvatarCircular ? 'rounded-full' : 'rounded'
                }`}>
                  {/* Avatar */}
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Sample user message */}
            <div className="flex justify-end mb-3">
              <div 
                className="rounded-lg px-3 py-2 max-w-[80%]"
                style={{ backgroundColor: config.branding.primaryColor, color: 'white' }}
              >
                Just testing things out 🙌
              </div>
            </div>
            
            {/* Sample response */}
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                Sure! Let me know if you have any questions.
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input 
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder={texts.inputPlaceholder}
                disabled
              />
              <button 
                className="p-2 rounded-lg"
                style={{ backgroundColor: config.branding.primaryColor }}
              >
                <ArrowUp className="text-white" size={16} />
              </button>
            </div>
            {!config.config.hidePoweredBy && (
              <div className="text-center text-xs text-gray-400 mt-2">
                Powered by Chatbox
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Task 2.10: Update Embed Route for Widget Config

**File to modify**: `src/routes/embed.$agentId.tsx`

**Changes**:

1. Accept optional `widgetId` URL param
2. Fetch widget configuration from database
3. Apply all configuration settings
4. Handle locale detection

```typescript
function EmbedChat() {
  const { agentId } = Route.useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const widgetId = searchParams.get("widgetId");
  const requestedLocale = searchParams.get("lang");
  
  const [detectedLocale, setDetectedLocale] = useState<string>(() => {
    // Check URL param first
    if (requestedLocale) return requestedLocale;
    // Then localStorage
    const stored = localStorage.getItem("preferred_locale");
    if (stored) return stored;
    // Then browser
    return navigator.language.split("-")[0] || "en";
  });
  
  // Fetch widget config (uses default if no widgetId)
  const widgetData = useQuery(api.widgetConfig.getWidgetConfigForEmbed, {
    agentId: agentId as Id<"agents">,
    widgetId: widgetId as Id<"widgetConfigurations"> | undefined,
    locale: detectedLocale,
  });
  
  if (!widgetData) {
    return <LoadingSpinner />;
  }
  
  const { config, texts } = widgetData;
  
  // Apply config to widget...
}
```

---

## Phase 3: Multi-Language Support

### Task 3.1: Locale Utilities

**File to create**: `src/lib/locale.ts`

```typescript
export function detectUserLocale(): string {
  // 1. Check URL param ?lang=xx
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam && isValidLocale(langParam)) {
    return langParam;
  }
  
  // 2. Check localStorage
  const stored = localStorage.getItem("chatbox_locale");
  if (stored && isValidLocale(stored)) {
    return stored;
  }
  
  // 3. Check navigator.language
  const browserLang = navigator.language.split("-")[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }
  
  // 4. Default
  return "en";
}

export function isValidLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale);
}

export function getBestMatchingLocale(
  availableLocales: string[],
  preferredLocale: string
): string {
  // Exact match
  if (availableLocales.includes(preferredLocale)) {
    return preferredLocale;
  }
  
  // Language code match (e.g., "en-US" -> "en")
  const langCode = preferredLocale.split("-")[0];
  if (availableLocales.includes(langCode)) {
    return langCode;
  }
  
  // Return first available (should be default)
  return availableLocales[0] || "en";
}

export const SUPPORTED_LOCALES = [
  "en", "es", "fr", "de", "it", "pt", "nl", "pl", "cs", "sk",
  "ru", "uk", "ja", "ko", "zh", "ar", "hi", "tr", "vi", "th"
];
```

---

### Task 3.2: Languages Configuration

**File to create**: `src/lib/languages.ts`

```typescript
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name || code.toUpperCase();
}
```

---

### Task 3.3: AI Response Localization

**File to modify**: `convex/chat.ts`

**Update `generateResponseWithContext`** to accept and use locale:

```typescript
export const generateResponseWithContext = internalAction({
  args: {
    agentId: v.id("agents"),
    userMessage: v.string(),
    relevantKnowledge: v.array(v.object({...})),
    conversationHistory: v.array(v.object({...})),
    locale: v.optional(v.string()), // NEW
  },
  handler: async (ctx, args): Promise<string> => {
    const agent = await ctx.runQuery(internal.agents.getAgentByIdInternal, { agentId: args.agentId });
    if (!agent) throw new Error("Agent not found");

    // Get language name for prompt
    const languageName = args.locale ? getLanguageNameForPrompt(args.locale) : "English";

    const systemPrompt = `You are ${agent.name}, an AI assistant. ${agent.description || ''}

${agent.instructions || ''}

You have access to the following knowledge base:
${knowledgeContext}

LANGUAGE INSTRUCTION: You MUST respond in ${languageName}. 
Regardless of what language the user writes in, always respond in ${languageName}.
This is critical - never respond in a different language.`;

    // ... rest of function
  },
});

function getLanguageNameForPrompt(locale: string): string {
  const map: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    pl: "Polish",
    cs: "Czech",
    sk: "Slovak",
    ru: "Russian",
    uk: "Ukrainian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese (Simplified)",
    ar: "Arabic",
    hi: "Hindi",
    tr: "Turkish",
    vi: "Vietnamese",
    th: "Thai",
  };
  return map[locale] || "English";
}
```

**Update `generateAIResponse`** to pass locale:

```typescript
export const generateAIResponse = action({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    locale: v.optional(v.string()), // NEW
  },
  handler: async (ctx, args) => {
    // ... existing code ...
    
    const aiResponse = await ctx.runAction(internal.chat.generateResponseWithContext, {
      agentId: conversation.agentId,
      userMessage: args.userMessage,
      relevantKnowledge: relevantKnowledge.map(...),
      conversationHistory: messages.slice(-10).map(...),
      locale: args.locale, // NEW - pass through
    });
    
    // ... rest
  },
});
```

---

### Task 3.4: Widget Locale Integration

**Update**: `src/components/ChatBubbleWidget.tsx` and `src/routes/embed.$agentId.tsx`

Pass detected locale to AI requests:

```typescript
// In sendMessage function
const response = await generateAIResponse({
  conversationId: currentConversationId,
  userMessage: content,
  locale: detectedLocale, // Add this
});
```

---

## Navigation Updates

### Task: Add Widget Designer to Navigation

**Files to modify**:
- `src/routes/dashboard.agents.$agentId.tsx` - Add "Widget" link in agent navigation
- `src/components/layout/Sidebar.tsx` - If there's a sidebar, add widget link

Add navigation item between "Settings" and other items:

```typescript
{
  name: "Widget Designer",
  href: `/dashboard/agents/${agentId}/widget`,
  icon: Paintbrush, // or Layout
}
```

---

## Testing Checklist

After implementation, verify:

### Phase 1
- [ ] Creating agent when at limit shows error
- [ ] Sending message when credits exhausted shows error
- [ ] Adding knowledge when at character limit shows error
- [ ] Usage dashboard shows all metrics
- [ ] Progress bars update in real-time
- [ ] Usage alerts sent at 75% and 90%

### Phase 2
- [ ] Can create new widget configuration
- [ ] Can edit all branding settings
- [ ] Preview updates in real-time
- [ ] Can add multiple greeting messages
- [ ] Can add translations
- [ ] Embed widget loads configuration
- [ ] Default widget used when no ID specified

### Phase 3
- [ ] Locale detected from browser
- [ ] URL param overrides detection
- [ ] AI responds in correct language
- [ ] Widget texts load in correct language
- [ ] Fallback to default locale works
