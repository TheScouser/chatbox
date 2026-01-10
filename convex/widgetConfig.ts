import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateOrganizationAccessQuery } from "./helpers";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Use the shared helper function
const validateOrganizationAccess = validateOrganizationAccessQuery;

// Default values for new widget
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

// Get all widget configs for an agent
export const getWidgetConfigsForAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    // Get all widget configs for this agent
    const widgetConfigs = await ctx.db
      .query("widgetConfigurations")
      .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
      .collect();

    // Get default locale texts for each widget
    const configsWithTexts = await Promise.all(
      widgetConfigs.map(async (config) => {
        const defaultTexts = await ctx.db
          .query("widgetTexts")
          .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", config._id))
          .filter((q) => q.eq(q.field("isDefault"), true))
          .first();

        return {
          ...config,
          defaultTexts: defaultTexts || null,
        };
      })
    );

    return configsWithTexts;
  },
});

// Get single widget config with all locale texts
export const getWidgetConfigById = query({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get the widget config
    const widgetConfig = await ctx.db.get(args.widgetConfigId);
    if (!widgetConfig) {
      throw new Error("Widget configuration not found");
    }

    // Get the agent to validate access
    const agent = await ctx.db.get(widgetConfig.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has access to agent's organization
    await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

    // Get all locale texts for this widget
    const texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
      .collect();

    return {
      ...widgetConfig,
      texts,
    };
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
    // Get the agent (no auth check for public embed)
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    let widgetConfig;

    // If widgetId provided, use that; otherwise use default
    if (args.widgetId) {
      widgetConfig = await ctx.db.get(args.widgetId);
      if (!widgetConfig || widgetConfig.agentId !== args.agentId) {
        throw new Error("Widget configuration not found");
      }
    } else {
      // Get default widget for this agent
      widgetConfig = await ctx.db
        .query("widgetConfigurations")
        .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();

      if (!widgetConfig) {
        // If no default, get the first widget for this agent
        widgetConfig = await ctx.db
          .query("widgetConfigurations")
          .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
          .first();

        if (!widgetConfig) {
          throw new Error("No widget configuration found for this agent");
        }
      }
    }

    // Get texts for requested locale or fallback to default
    const requestedLocale = args.locale || "en";
    
    // Try to get texts for requested locale
    let texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId_locale", (q) => 
        q.eq("widgetConfigId", widgetConfig._id).eq("locale", requestedLocale)
      )
      .first();

    // If not found, get default locale texts
    if (!texts) {
      texts = await ctx.db
        .query("widgetTexts")
        .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", widgetConfig._id))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
    }

    if (!texts) {
      throw new Error("Widget texts not found");
    }

    // Return combined config + texts
    return {
      ...widgetConfig,
      texts: texts.texts,
      locale: texts.locale,
    };
  },
});

// Create new widget configuration
export const createWidgetConfig = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    branding: v.optional(v.object({
      logoStorageId: v.optional(v.id("_storage")),
      primaryColor: v.optional(v.string()),
      foregroundColor: v.optional(v.string()),
      showHeaderIcon: v.optional(v.boolean()),
      headerIconCircular: v.optional(v.boolean()),
      botAvatarCircular: v.optional(v.boolean()),
      botAvatarType: v.optional(v.union(v.literal("logo"), v.literal("custom"))),
      botAvatarStorageId: v.optional(v.id("_storage")),
    })),
    interface: v.optional(v.object({
      position: v.optional(v.union(v.literal("bottom-right"), v.literal("bottom-left"))),
      offsetX: v.optional(v.number()),
      offsetY: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
    aiSettings: v.optional(v.object({
      model: v.optional(v.string()),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    })),
    config: v.optional(v.object({
      hidePoweredBy: v.optional(v.boolean()),
      showRating: v.optional(v.boolean()),
      allowTranscriptDownload: v.optional(v.boolean()),
      voiceInputEnabled: v.optional(v.boolean()),
      voiceMaxDuration: v.optional(v.number()),
      showAiSources: v.optional(v.boolean()),
      hoveringMessageDesktop: v.optional(v.boolean()),
      hoveringMessageMobile: v.optional(v.boolean()),
      autoOpenChat: v.optional(v.boolean()),
      autoOpenDelay: v.optional(v.number()),
    })),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Check if this should be the default widget
    const shouldBeDefault = args.isDefault ?? false;

    // If setting as default, unset other defaults
    if (shouldBeDefault) {
      const existingWidgets = await ctx.db
        .query("widgetConfigurations")
        .withIndex("agentId", (q) => q.eq("agentId", args.agentId))
        .collect();

      for (const widget of existingWidgets) {
        if (widget.isDefault) {
          await ctx.db.patch(widget._id, { isDefault: false });
        }
      }
    }

    // Merge provided values with defaults
    const branding = {
      ...defaultBranding,
      ...args.branding,
    };

    const interface_ = {
      ...defaultInterface,
      ...args.interface,
    };

    const aiSettings = {
      ...defaultAiSettings,
      ...args.aiSettings,
    };

    const config = {
      ...defaultConfig,
      ...args.config,
    };

    const now = Date.now();

    // Create widget configuration
    const widgetConfigId = await ctx.db.insert("widgetConfigurations", {
      agentId: args.agentId,
      name: args.name,
      isDefault: shouldBeDefault,
      branding,
      interface: interface_,
      aiSettings,
      config,
      createdAt: now,
      updatedAt: now,
    });

    // Create default English texts
    await ctx.db.insert("widgetTexts", {
      widgetConfigId,
      locale: "en",
      isDefault: true,
      texts: defaultTexts,
      createdAt: now,
      updatedAt: now,
    });

    return widgetConfigId;
  },
});

// Update widget configuration
export const updateWidgetConfig = mutation({
  args: {
    widgetConfigId: v.id("widgetConfigurations"),
    name: v.optional(v.string()),
    branding: v.optional(v.object({
      logoStorageId: v.optional(v.id("_storage")),
      primaryColor: v.optional(v.string()),
      foregroundColor: v.optional(v.string()),
      showHeaderIcon: v.optional(v.boolean()),
      headerIconCircular: v.optional(v.boolean()),
      botAvatarCircular: v.optional(v.boolean()),
      botAvatarType: v.optional(v.union(v.literal("logo"), v.literal("custom"))),
      botAvatarStorageId: v.optional(v.id("_storage")),
    })),
    interface: v.optional(v.object({
      position: v.optional(v.union(v.literal("bottom-right"), v.literal("bottom-left"))),
      offsetX: v.optional(v.number()),
      offsetY: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    })),
    aiSettings: v.optional(v.object({
      model: v.optional(v.string()),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    })),
    config: v.optional(v.object({
      hidePoweredBy: v.optional(v.boolean()),
      showRating: v.optional(v.boolean()),
      allowTranscriptDownload: v.optional(v.boolean()),
      voiceInputEnabled: v.optional(v.boolean()),
      voiceMaxDuration: v.optional(v.number()),
      showAiSources: v.optional(v.boolean()),
      hoveringMessageDesktop: v.optional(v.boolean()),
      hoveringMessageMobile: v.optional(v.boolean()),
      autoOpenChat: v.optional(v.boolean()),
      autoOpenDelay: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the widget config
    const widgetConfig = await ctx.db.get(args.widgetConfigId);
    if (!widgetConfig) {
      throw new Error("Widget configuration not found");
    }

    // Get the agent to validate access
    const agent = await ctx.db.get(widgetConfig.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updateData.name = args.name;
    }

    if (args.branding !== undefined) {
      updateData.branding = {
        ...widgetConfig.branding,
        ...args.branding,
      };
    }

    if (args.interface !== undefined) {
      updateData.interface = {
        ...widgetConfig.interface,
        ...args.interface,
      };
    }

    if (args.aiSettings !== undefined) {
      updateData.aiSettings = {
        ...widgetConfig.aiSettings,
        ...args.aiSettings,
      };
    }

    if (args.config !== undefined) {
      updateData.config = {
        ...widgetConfig.config,
        ...args.config,
      };
    }

    // Update the widget config
    await ctx.db.patch(args.widgetConfigId, updateData);

    return args.widgetConfigId;
  },
});

// Delete widget configuration
export const deleteWidgetConfig = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get the widget config
    const widgetConfig = await ctx.db.get(args.widgetConfigId);
    if (!widgetConfig) {
      throw new Error("Widget configuration not found");
    }

    // Get the agent to validate access
    const agent = await ctx.db.get(widgetConfig.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Delete all associated widgetTexts first
    const texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
      .collect();

    for (const text of texts) {
      await ctx.db.delete(text._id);
    }

    // Delete widget config
    await ctx.db.delete(args.widgetConfigId);

    return { success: true };
  },
});

// Duplicate widget configuration
export const duplicateWidgetConfig = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get existing config
    const widgetConfig = await ctx.db.get(args.widgetConfigId);
    if (!widgetConfig) {
      throw new Error("Widget configuration not found");
    }

    // Get the agent to validate access
    const agent = await ctx.db.get(widgetConfig.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Get all texts
    const texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
      .collect();

    const now = Date.now();

    // Create copy with name "(Copy)"
    const { _id, _creationTime, ...widgetConfigData } = widgetConfig;
    const newWidgetConfigId = await ctx.db.insert("widgetConfigurations", {
      ...widgetConfigData,
      name: `${widgetConfig.name} (Copy)`,
      isDefault: false, // Duplicates are never default
      createdAt: now,
      updatedAt: now,
    });

    // Copy all texts
    for (const text of texts) {
      const { _id: textId, _creationTime: textCreationTime, ...textData } = text;
      await ctx.db.insert("widgetTexts", {
        ...textData,
        widgetConfigId: newWidgetConfigId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return newWidgetConfigId;
  },
});

// Set as default widget for agent
export const setDefaultWidget = mutation({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Get the widget config
    const widgetConfig = await ctx.db.get(args.widgetConfigId);
    if (!widgetConfig) {
      throw new Error("Widget configuration not found");
    }

    // Get the agent to validate access
    const agent = await ctx.db.get(widgetConfig.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Validate user has editor access
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Unset isDefault on all other widgets for same agent
    const existingWidgets = await ctx.db
      .query("widgetConfigurations")
      .withIndex("agentId", (q) => q.eq("agentId", widgetConfig.agentId))
      .collect();

    for (const widget of existingWidgets) {
      if (widget._id !== args.widgetConfigId && widget.isDefault) {
        await ctx.db.patch(widget._id, { isDefault: false });
      }
    }

    // Set isDefault on this widget
    await ctx.db.patch(args.widgetConfigId, { 
      isDefault: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
