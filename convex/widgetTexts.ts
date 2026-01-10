import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateOrganizationAccessQuery } from "./helpers";

// Use the shared helper function
const validateOrganizationAccess = validateOrganizationAccessQuery;

// Helper function to get widget config and validate access
async function getWidgetConfigAndValidate(ctx: any, widgetConfigId: string) {
  const widgetConfig = await ctx.db.get(widgetConfigId);
  if (!widgetConfig) {
    throw new Error("Widget configuration not found");
  }

  const agent = await ctx.db.get(widgetConfig.agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  await validateOrganizationAccess(ctx, agent.organizationId, "viewer");

  return { widgetConfig, agent };
}

// Get all texts for a widget (all locales)
export const getWidgetTexts = query({
  args: { widgetConfigId: v.id("widgetConfigurations") },
  handler: async (ctx, args) => {
    // Validate access via widget -> agent -> organization
    await getWidgetConfigAndValidate(ctx, args.widgetConfigId);

    // Return all locale texts
    const texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
      .collect();

    return texts;
  },
});

// Get texts for specific locale
export const getWidgetTextsByLocale = query({
  args: { 
    widgetConfigId: v.id("widgetConfigurations"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate access
    await getWidgetConfigAndValidate(ctx, args.widgetConfigId);

    // Try to get texts for requested locale
    let texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId_locale", (q) => 
        q.eq("widgetConfigId", args.widgetConfigId).eq("locale", args.locale)
      )
      .first();

    // If not found, return default locale texts
    if (!texts) {
      texts = await ctx.db
        .query("widgetTexts")
        .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
    }

    return texts;
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
    // Validate access (need editor access to modify texts)
    const { agent } = await getWidgetConfigAndValidate(ctx, args.widgetConfigId);
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Check if texts exist for this locale
    const existingTexts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId_locale", (q) => 
        q.eq("widgetConfigId", args.widgetConfigId).eq("locale", args.locale)
      )
      .first();

    const shouldBeDefault = args.isDefault ?? false;

    // If setting as default, unset other defaults for this widget
    if (shouldBeDefault) {
      const allTexts = await ctx.db
        .query("widgetTexts")
        .withIndex("widgetConfigId", (q) => q.eq("widgetConfigId", args.widgetConfigId))
        .collect();

      for (const text of allTexts) {
        if (text._id !== existingTexts?._id && text.isDefault) {
          await ctx.db.patch(text._id, { isDefault: false });
        }
      }
    }

    const now = Date.now();

    if (existingTexts) {
      // Update existing texts
      await ctx.db.patch(existingTexts._id, {
        isDefault: shouldBeDefault,
        texts: args.texts,
        updatedAt: now,
      });
      return existingTexts._id;
    } else {
      // Insert new texts
      const textId = await ctx.db.insert("widgetTexts", {
        widgetConfigId: args.widgetConfigId,
        locale: args.locale,
        isDefault: shouldBeDefault,
        texts: args.texts,
        createdAt: now,
        updatedAt: now,
      });
      return textId;
    }
  },
});

// Delete texts for a locale (cannot delete default)
export const deleteWidgetTexts = mutation({
  args: { 
    widgetConfigId: v.id("widgetConfigurations"),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate access (need editor access to delete texts)
    const { agent } = await getWidgetConfigAndValidate(ctx, args.widgetConfigId);
    await validateOrganizationAccess(ctx, agent.organizationId, "editor");

    // Get texts for this locale
    const texts = await ctx.db
      .query("widgetTexts")
      .withIndex("widgetConfigId_locale", (q) => 
        q.eq("widgetConfigId", args.widgetConfigId).eq("locale", args.locale)
      )
      .first();

    if (!texts) {
      throw new Error("Texts not found for this locale");
    }

    // Check not deleting default locale
    if (texts.isDefault) {
      throw new Error("Cannot delete default locale texts");
    }

    // Delete
    await ctx.db.delete(texts._id);

    return { success: true };
  },
});
