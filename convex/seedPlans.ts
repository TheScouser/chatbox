import { internalMutation } from "./_generated/server";

export const seedSubscriptionPlans = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if plans already exist
    const existingPlans = await ctx.db.query("subscriptionPlans").collect();
    
    if (existingPlans.length > 0) {
      console.log("Subscription plans already exist, skipping seed");
      return { message: "Plans already exist" };
    }

    const plans = [
      {
        name: "Starter",
        stripeProductId: "prod_starter", // Replace with actual Stripe product ID
        stripePriceId: "price_starter", // Replace with actual Stripe price ID
        price: 900, // $9 in cents
        interval: "month" as const,
        features: {
          maxAgents: 3,
          maxKnowledgeEntries: 500,
          maxMessagesPerMonth: 5000,
          maxFileUploads: 50,
          maxFileSizeMB: 10,
          prioritySupport: false,
          customDomains: true,
          advancedAnalytics: false,
          apiAccess: false,
          webhookIntegrations: false,
          customBranding: false,
          ssoIntegration: false,
          auditLogs: false,
        },
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Standard",
        stripeProductId: "prod_standard", // Replace with actual Stripe product ID
        stripePriceId: "price_standard", // Replace with actual Stripe price ID
        price: 2900, // $29 in cents
        interval: "month" as const,
        features: {
          maxAgents: 10,
          maxKnowledgeEntries: 2000,
          maxMessagesPerMonth: 25000,
          maxFileUploads: 200,
          maxFileSizeMB: 25,
          prioritySupport: true,
          customDomains: true,
          advancedAnalytics: true,
          apiAccess: true,
          webhookIntegrations: true,
          customBranding: false,
          ssoIntegration: false,
          auditLogs: false,
        },
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Pro",
        stripeProductId: "prod_pro", // Replace with actual Stripe product ID
        stripePriceId: "price_pro", // Replace with actual Stripe price ID
        price: 9900, // $99 in cents
        interval: "month" as const,
        features: {
          maxAgents: 50,
          maxKnowledgeEntries: 10000,
          maxMessagesPerMonth: 100000,
          maxFileUploads: 1000,
          maxFileSizeMB: 100,
          prioritySupport: true,
          customDomains: true,
          advancedAnalytics: true,
          apiAccess: true,
          webhookIntegrations: true,
          customBranding: true,
          ssoIntegration: true,
          auditLogs: true,
        },
        isActive: true,
        sortOrder: 3,
      },
    ];

    const insertedPlans = [];
    for (const plan of plans) {
      const planId = await ctx.db.insert("subscriptionPlans", plan);
      insertedPlans.push({ ...plan, _id: planId });
    }

    console.log(`Seeded ${insertedPlans.length} subscription plans`);
    return { 
      message: `Successfully seeded ${insertedPlans.length} subscription plans`,
      plans: insertedPlans 
    };
  },
}); 