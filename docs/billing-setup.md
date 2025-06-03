# Billing & Monetization System

This document describes the complete billing and monetization system implemented for the AI Agent Platform.

## Overview

The billing system provides:
- **4-tier subscription plans**: Free, Starter ($9), Standard ($29), Pro ($99)
- **Feature gating**: Control access to premium features based on subscription
- **Usage tracking**: Monitor and limit usage based on plan limits
- **Stripe integration**: Secure payment processing and subscription management
- **Self-service billing**: Users can upgrade, downgrade, and manage their subscriptions

## Architecture

### Backend (Convex)
- `convex/billing.ts` - Core billing functions
- `convex/featureGates.ts` - Feature access control and usage limits
- `convex/schema.ts` - Database schema for subscriptions and usage
- `convex/seedPlans.ts` - Initial plan setup

### Frontend (React)
- `src/hooks/useFeatureAccess.ts` - React hooks for feature gates
- `src/components/billing/` - Billing UI components
- `src/routes/dashboard.billing.*` - Billing dashboard pages

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Stripe Setup

1. **Create Products in Stripe Dashboard:**
   ```
   Starter Plan - $9/month
   Standard Plan - $29/month  
   Pro Plan - $99/month
   ```

2. **Update Plan IDs in `convex/seedPlans.ts`:**
   ```typescript
   stripeProductId: "prod_actual_id_from_stripe"
   stripePriceId: "price_actual_id_from_stripe"
   ```

3. **Set up Webhooks:**
   - Endpoint: `https://your-app.convex.cloud/stripe/webhook`
   - Events: `customer.subscription.*`, `invoice.payment_*`

### 3. Database Setup

Run the seed function to create initial plans:

```bash
# In Convex dashboard or via CLI
npx convex run seedPlans:seedSubscriptionPlans
```

## Plan Structure

### Free Plan
- 1 agent
- 50 knowledge entries
- 500 messages/month
- 5 file uploads
- 2MB max file size

### Starter Plan ($9/month)
- 3 agents
- 500 knowledge entries
- 5,000 messages/month
- 50 file uploads
- 10MB max file size
- ✅ Custom domains

### Standard Plan ($29/month)
- 10 agents
- 2,000 knowledge entries
- 25,000 messages/month
- 200 file uploads
- 25MB max file size
- ✅ Custom domains
- ✅ Priority support
- ✅ Advanced analytics
- ✅ API access
- ✅ Webhook integrations

### Pro Plan ($99/month)
- 50 agents
- 10,000 knowledge entries
- 100,000 messages/month
- 1,000 file uploads
- 100MB max file size
- ✅ All Standard features
- ✅ Custom branding
- ✅ SSO integration
- ✅ Audit logs

## Usage Examples

### Feature Gating

```typescript
import { FeatureGate } from "@/components/billing/FeatureGateExample";

function MyComponent() {
  return (
    <FeatureGate feature="custom_domains">
      <CustomDomainSettings />
    </FeatureGate>
  );
}
```

### Usage Limits

```typescript
import { useUsageLimit } from "@/hooks/useFeatureAccess";

function CreateAgentButton() {
  const { canPerformAction, percentUsed } = useUsageLimit("agents");
  
  return (
    <Button 
      disabled={!canPerformAction}
      onClick={handleCreateAgent}
    >
      Create Agent {percentUsed > 80 && `(${percentUsed.toFixed(0)}% used)`}
    </Button>
  );
}
```

### Plan Information

```typescript
import { useUserPlan } from "@/hooks/useFeatureAccess";

function PlanDisplay() {
  const { plan, isFree, planName } = useUserPlan();
  
  return (
    <div>
      <h3>Current Plan: {planName}</h3>
      {isFree && <UpgradePrompt />}
    </div>
  );
}
```

## API Reference

### Billing Functions

#### `getUserPlan()`
Returns the user's current plan (including free plan defaults).

#### `getUserSubscription()`
Returns the user's active subscription details.

#### `createCheckoutSession(planId, successUrl, cancelUrl)`
Creates a Stripe checkout session for plan upgrade.

#### `createPortalSession(returnUrl)`
Creates a Stripe customer portal session for subscription management.

### Feature Gate Functions

#### `checkFeatureAccess(feature)`
Checks if user has access to a specific feature.

**Features:**
- `priority_support`
- `custom_domains`
- `advanced_analytics`
- `api_access`
- `webhook_integrations`
- `custom_branding`
- `sso_integration`
- `audit_logs`

#### `checkUsageLimit(metric)`
Checks current usage against plan limits.

**Metrics:**
- `agents`
- `messages`
- `knowledge_entries`
- `file_uploads`

#### `trackUsage(metric, amount)`
Records usage for billing purposes.

## Navigation

The billing system is accessible via:
- **Dashboard Navigation**: "Billing" tab in the main navigation
- **Direct URLs**:
  - `/dashboard/billing` - Main billing dashboard
  - `/dashboard/billing/plans` - Plan selection page

## Testing

### Test Mode
- Use Stripe test keys for development
- Test cards: `4242 4242 4242 4242` (Visa)
- Use webhook testing with Stripe CLI

### Feature Testing
1. Create test user
2. Verify free plan limits
3. Upgrade to paid plan
4. Test feature access
5. Test usage tracking

## Security Considerations

- All Stripe operations use server-side keys
- Webhook signatures are verified
- User authentication required for all billing operations
- Feature gates prevent unauthorized access

## Monitoring

### Key Metrics to Track
- Subscription conversion rates
- Feature usage by plan
- Churn rates
- Revenue per user
- Support ticket volume by plan

### Alerts to Set Up
- Failed payments
- Subscription cancellations
- High usage approaching limits
- Webhook failures

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL in Stripe dashboard
   - Verify webhook secret in environment variables
   - Check Convex logs for errors

2. **Feature gates not working**
   - Verify user authentication
   - Check subscription status in database
   - Ensure plan features are correctly configured

3. **Usage tracking not updating**
   - Check if `trackUsage` is being called
   - Verify database permissions
   - Check for rate limiting issues

### Debug Tools

```typescript
// Check user's current plan
const plan = await ctx.runQuery(api.billing.getUserPlan, {});
console.log("User plan:", plan);

// Check feature access
const access = await ctx.runQuery(api.featureGates.checkFeatureAccess, { 
  feature: "custom_domains" 
});
console.log("Feature access:", access);
```

## Future Enhancements

### Planned Features
- Annual billing discounts
- Usage-based overage billing
- Team/organization plans
- Custom enterprise contracts
- Referral program
- Billing analytics dashboard

### Integration Opportunities
- Email marketing (plan-based segments)
- Customer support (plan context)
- Product analytics (feature usage)
- A/B testing (pricing experiments)

## Support

For billing-related issues:
1. Check this documentation
2. Review Stripe dashboard for payment issues
3. Check Convex logs for backend errors
4. Contact development team for feature requests 