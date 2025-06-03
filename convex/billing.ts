import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";

// Initialize Stripe (will be undefined in development if not configured)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    })
  : null;

// Get all active subscription plans
export const getSubscriptionPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptionPlans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

// Get user's current subscription (updated for organizations)
export const getUserSubscription = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // If organizationId is provided, check subscription for that organization
    // Otherwise, get subscription for user's default organization
    let targetOrgId = args.organizationId;
    
    if (!targetOrgId) {
      // Get user's first organization (for backward compatibility)
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();
      
      if (!membership) {
        return null;
      }
      
      targetOrgId = membership.organizationId;
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", targetOrgId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Not authorized to access this organization's subscription");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", targetOrgId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return null;
    }

    const plan = await ctx.db.get(subscription.planId);
    return {
      ...subscription,
      plan,
    };
  },
});

// Get user's current plan (includes free plan) - updated for organizations
export const getUserPlan = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // If organizationId is provided, check plan for that organization
    // Otherwise, get plan for user's default organization
    let targetOrgId = args.organizationId;
    
    if (!targetOrgId) {
      // Get user's first organization (for backward compatibility)
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();
      
      if (!membership) {
        return getFreePlanFeatures();
      }
      
      targetOrgId = membership.organizationId;
    }

    // Verify user has access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", targetOrgId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Not authorized to access this organization's plan");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", targetOrgId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (subscription) {
      const plan = await ctx.db.get(subscription.planId);
      return plan;
    }

    // Return free plan features if no subscription
    return getFreePlanFeatures();
  },
});

// Helper function to get free plan features
function getFreePlanFeatures() {
  return {
    name: "Free",
    price: 0,
    features: {
      maxAgents: 1,
      maxKnowledgeEntries: 50,
      maxMessagesPerMonth: 500,
      maxFileUploads: 5,
      maxFileSizeMB: 2,
      prioritySupport: false,
      customDomains: false,
      advancedAnalytics: false,
      apiAccess: false,
      webhookIntegrations: false,
      customBranding: false,
      ssoIntegration: false,
      auditLogs: false,
    },
  };
}

// Create Stripe customer (updated for organizations)
export const createStripeCustomer = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

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

    // Verify user has admin access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Not authorized to manage billing for this organization");
    }

    // Check if customer already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (existingSubscription) {
      return existingSubscription.stripeCustomerId;
    }

    // Get organization details
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: identity.email,
      name: organization.name,
      metadata: {
        organizationId: args.organizationId,
        userId: user._id,
        clerkId: identity.subject,
      },
    });

    return customer.id;
  },
});

// Create checkout session (updated for organizations)
export const createCheckoutSession = mutation({
  args: {
    organizationId: v.id("organizations"),
    planId: v.id("subscriptionPlans"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

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

    // Verify user has admin access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Not authorized to manage billing for this organization");
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get or create Stripe customer
    let customerId: string;
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (existingSubscription) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: identity.email,
        name: organization.name,
        metadata: {
          organizationId: args.organizationId,
          userId: user._id,
          clerkId: identity.subject,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        organizationId: args.organizationId,
        planId: args.planId,
      },
    });

    return session.url;
  },
});

// Create portal session for subscription management (updated for organizations)
export const createPortalSession = mutation({
  args: {
    organizationId: v.id("organizations"),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }

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

    // Verify user has admin access to this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("userId_organizationId", (q) => 
        q.eq("userId", user._id).eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
      throw new Error("Not authorized to manage billing for this organization");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!subscription) {
      throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return session.url;
  },
});

// Handle Stripe webhook
export const handleStripeWebhook = internalMutation({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { type, data } = args;

    switch (type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(ctx, data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(ctx, data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(ctx, data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(ctx, data.object);
        break;
    }
  },
});

// Helper functions
async function handleSubscriptionUpdate(ctx: any, subscription: any) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  
  // Find the plan by Stripe price ID
  const plan = await ctx.db
    .query("subscriptionPlans")
    .filter((q: any) => q.eq(q.field("stripePriceId"), subscription.items.data[0].price.id))
    .first();

  if (!plan) {
    console.error("Plan not found for price ID:", subscription.items.data[0].price.id);
    return;
  }

  // Get user by metadata or customer ID
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("User ID not found in subscription metadata");
    return;
  }

  // Get user details for email
  const user = await ctx.db.get(userId);
  if (!user) {
    console.error("User not found:", userId);
    return;
  }

  // Update or create subscription record
  const existingSubscription = await ctx.db
    .query("subscriptions")
    .withIndex("stripeSubscriptionId", (q: any) => q.eq("stripeSubscriptionId", subscriptionId))
    .first();

  const subscriptionData = {
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    planId: plan._id,
    status,
    currentPeriodStart: subscription.current_period_start * 1000,
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  let isNewSubscription = false;
  if (existingSubscription) {
    await ctx.db.patch(existingSubscription._id, subscriptionData);
  } else {
    await ctx.db.insert("subscriptions", subscriptionData);
    isNewSubscription = true;
  }

  // Send email notification for plan upgrade/new subscription
  if (status === "active" && user.email) {
    try {
      await ctx.scheduler.runAfter(0, internal.emails.sendBillingNotification, {
        to: user.email,
        name: user.name || "Customer",
        type: isNewSubscription ? "plan_upgraded" : "plan_upgraded",
        planName: plan.name,
        nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
      });
    } catch (error) {
      console.error("Failed to schedule billing notification email:", error);
    }
  }
}

async function handleSubscriptionDeleted(ctx: any, subscription: any) {
  const subscriptionId = subscription.id;
  
  const existingSubscription = await ctx.db
    .query("subscriptions")
    .withIndex("stripeSubscriptionId", (q: any) => q.eq("stripeSubscriptionId", subscriptionId))
    .first();

  if (existingSubscription) {
    await ctx.db.patch(existingSubscription._id, { status: "canceled" });

    // Get user details for email
    const user = await ctx.db.get(existingSubscription.userId);
    const plan = await ctx.db.get(existingSubscription.planId);
    
    if (user && user.email && plan) {
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendBillingNotification, {
          to: user.email,
          name: user.name || "Customer",
          type: "subscription_cancelled",
          planName: plan.name,
        });
      } catch (error) {
        console.error("Failed to schedule cancellation notification email:", error);
      }
    }
  }
}

async function handlePaymentSucceeded(ctx: any, invoice: any) {
  // Handle successful payment - could trigger usage reset, send confirmation email, etc.
  console.log("Payment succeeded for invoice:", invoice.id);
  
  // Get subscription and user details
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("stripeSubscriptionId", (q: any) => q.eq("stripeSubscriptionId", subscriptionId))
    .first();

  if (subscription) {
    const user = await ctx.db.get(subscription.userId);
    const plan = await ctx.db.get(subscription.planId);
    
    if (user && user.email && plan) {
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendBillingNotification, {
          to: user.email,
          name: user.name || "Customer",
          type: "payment_success",
          planName: plan.name,
          amount: invoice.amount_paid,
          nextBillingDate: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Failed to schedule payment success notification email:", error);
      }
    }
  }
}

async function handlePaymentFailed(ctx: any, invoice: any) {
  // Handle failed payment - could send notification, pause service, etc.
  console.log("Payment failed for invoice:", invoice.id);
  
  // Get subscription and user details
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("stripeSubscriptionId", (q: any) => q.eq("stripeSubscriptionId", subscriptionId))
    .first();

  if (subscription) {
    const user = await ctx.db.get(subscription.userId);
    const plan = await ctx.db.get(subscription.planId);
    
    if (user && user.email && plan) {
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendBillingNotification, {
          to: user.email,
          name: user.name || "Customer",
          type: "payment_failed",
          planName: plan.name,
        });
      } catch (error) {
        console.error("Failed to schedule payment failed notification email:", error);
      }
    }
  }
} 