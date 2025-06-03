import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
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

// Get user's current subscription
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
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

// Get user's current plan (includes free plan)
export const getUserPlan = query({
  args: {},
  handler: async (ctx) => {
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (subscription) {
      const plan = await ctx.db.get(subscription.planId);
      return plan;
    }

    // Return free plan features if no subscription
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
  },
});

// Create Stripe customer
export const createStripeCustomer = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Check if customer already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingSubscription) {
      return existingSubscription.stripeCustomerId;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: identity.email,
      name: identity.name,
      metadata: {
        userId: user._id,
        clerkId: identity.subject,
      },
    });

    return customer.id;
  },
});

// Create checkout session
export const createCheckoutSession = mutation({
  args: {
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

    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    // Get or create Stripe customer
    let customerId: string;
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingSubscription) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: identity.email,
        name: identity.name,
        metadata: {
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
        userId: user._id,
        planId: args.planId,
      },
    });

    return session.url;
  },
});

// Create portal session for subscription management
export const createPortalSession = mutation({
  args: {
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

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
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

  if (existingSubscription) {
    await ctx.db.patch(existingSubscription._id, subscriptionData);
  } else {
    await ctx.db.insert("subscriptions", subscriptionData);
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
  }
}

async function handlePaymentSucceeded(ctx: any, invoice: any) {
  // Handle successful payment - could trigger usage reset, send confirmation email, etc.
  console.log("Payment succeeded for invoice:", invoice.id);
}

async function handlePaymentFailed(ctx: any, invoice: any) {
  // Handle failed payment - could send notification, pause service, etc.
  console.log("Payment failed for invoice:", invoice.id);
} 