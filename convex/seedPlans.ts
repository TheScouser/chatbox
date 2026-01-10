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