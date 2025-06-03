# Email System Setup & Configuration

This document explains how to set up and use the email system in the AI Agent Platform, built using [Resend](https://resend.com) and integrated with Convex.

## Overview

The email system provides comprehensive email functionality for:
- **Welcome emails** when users sign up
- **Billing notifications** for payments, cancellations, and plan changes
- **Usage alerts** when users approach plan limits
- **General notifications** for product updates and announcements

## Architecture

### Email Service (`convex/emails.ts`)
- Centralized email functions using Resend API
- Template-based HTML email generation
- Automatic scheduling through Convex
- Error handling and logging

### Integration Points
- **User Registration**: Welcome emails via `convex/users.ts`
- **Billing Events**: Stripe webhooks via `convex/billing.ts`
- **Usage Monitoring**: Automatic alerts via `convex/featureGates.ts`
- **Admin Functions**: Manual notifications via dashboard

## Setup Instructions

### 1. Get Resend API Key

1. Sign up for [Resend](https://resend.com)
2. Verify your domain (required for production)
3. Get your API key from the dashboard

### 2. Configure Environment Variables

Add to your Convex environment:

```bash
# Set via Convex dashboard or CLI
npx convex env set RESEND_API_KEY re_your_resend_api_key_here
```

Update `src/env.ts` (already done):
```typescript
server: {
  RESEND_API_KEY: z.string().optional(),
}
```

### 3. Domain Verification (Production)

For production use, verify your sending domain in Resend:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records
4. Update email addresses in `convex/emails.ts`:

```typescript
from: "AI Agent Platform <noreply@yourdomain.com>"
```

## Email Types & Templates

### 1. Welcome Email
**Trigger**: New user registration  
**Template**: Modern gradient design with onboarding steps  
**Content**: Plan benefits, getting started guide, helpful links

### 2. Billing Notifications
**Triggers**: Stripe webhook events
- Payment success/failure
- Subscription created/cancelled
- Plan upgrades/downgrades

**Templates**: Color-coded by notification type
- Green: Success notifications
- Red: Failed payments
- Orange: Warnings/cancellations
- Purple: Upgrades

### 3. Usage Alerts
**Triggers**: 80% and 95% usage thresholds  
**Template**: Progress bars with current usage stats  
**Content**: Usage breakdown, upgrade suggestions, optimization tips

### 4. General Notifications
**Triggers**: Manual admin actions  
**Types**: Product updates, announcements, maintenance, newsletters  
**Template**: Flexible content with branded design

## Testing

### Via Dashboard
1. Go to Settings → General
2. Scroll to "Email Testing" section
3. Enter recipient details
4. Select email type and customize content
5. Send test email

### Via Development
```bash
# Test welcome email
npx convex run emails:sendWelcomeEmail --to "test@example.com" --name "Test User"

# Test billing notification
npx convex run emails:sendBillingNotification --to "test@example.com" --name "Test User" --type "payment_success" --planName "Pro" --amount 9900
```

### Testing Automatic Triggers
- **Welcome Email**: Create a new user account
- **Usage Alerts**: Artificially increase usage metrics near limits
- **Billing Emails**: Use Stripe test webhooks

## Email Content Customization

### Updating Templates
Edit the HTML template functions in `convex/emails.ts`:

```typescript
function generateWelcomeEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <!-- Your custom HTML template -->
    </html>
  `;
}
```

### Brand Customization
Update these elements in templates:
- **Colors**: Change gradient and accent colors
- **Logo**: Replace with your logo URL
- **Content**: Update copy and messaging
- **Footer**: Update company info and links

### Dynamic Content
Templates support dynamic variables:
- `${name}` - User name
- `${planName}` - Subscription plan
- `${amount}` - Payment amounts
- `${percentUsed}` - Usage percentages

## Monitoring & Analytics

### Email Logs
- Check Convex logs for email sending results
- Monitor Resend dashboard for delivery stats
- Track bounces and complaints

### Success Tracking
```typescript
// Email functions return status
const result = await ctx.runAction(internal.emails.sendWelcomeEmail, {
  to: "user@example.com",
  name: "User"
});

if (result.success) {
  console.log("Email sent:", result.messageId);
} else {
  console.error("Email failed:", result.error);
}
```

## Production Checklist

### Before Launch
- [ ] Domain verified in Resend
- [ ] Email templates tested across clients (Gmail, Outlook, etc.)
- [ ] Unsubscribe links implemented
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Bounce handling implemented

### Email Best Practices
- **Subject Lines**: Clear, concise, actionable
- **Content**: Mobile-responsive, accessible HTML
- **Frequency**: Respect user preferences
- **Compliance**: GDPR, CAN-SPAM compliance
- **Testing**: Cross-client compatibility

## Troubleshooting

### Common Issues

**1. "Resend not configured" Error**
```
Solution: Check RESEND_API_KEY environment variable
Debug: Console will show "Resend not configured, skipping email"
```

**2. Emails Not Sending**
```
Possible causes:
- Invalid Resend API key
- Domain not verified (production)
- Rate limits exceeded
- Invalid email addresses

Check Resend dashboard for delivery logs
```

**3. Template Rendering Issues**
```
Solution: Validate HTML templates
- Check for missing variables
- Ensure proper escaping
- Test across email clients
```

**4. Webhook Email Failures**
```
Debug: Check Convex function logs
- Verify user data exists
- Check scheduler syntax
- Validate webhook payload
```

### Debug Commands

```bash
# Check email configuration
npx convex logs --component emails

# Test Resend connectivity
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"from": "test@yourdomain.com", "to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
```

## Rate Limits & Quotas

### Resend Limits
- **Free Plan**: 100 emails/day, 3,000/month
- **Paid Plans**: Higher limits based on plan
- **Rate Limit**: 10 requests/second

### Best Practices
- Use email queueing for bulk sends
- Implement exponential backoff for retries
- Monitor usage via Resend dashboard

## Security Considerations

### Email Security
- Use environment variables for API keys
- Validate recipient email addresses
- Implement rate limiting
- Log email activities

### Content Security
- Sanitize user-generated content
- Avoid exposing sensitive data
- Use secure links (HTTPS)
- Implement click tracking carefully

## Future Enhancements

### Planned Features
- Email preferences management
- Unsubscribe handling
- Email templates editor (admin UI)
- A/B testing for subject lines
- Advanced analytics and reporting
- Email scheduling
- Bulk email campaigns

### Integration Opportunities
- CRM systems
- Analytics platforms
- Customer support tools
- Marketing automation

## Support & Resources

### Documentation
- [Resend API Docs](https://resend.com/docs)
- [Convex Scheduler Docs](https://docs.convex.dev/scheduling)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)

### Testing Tools
- [Litmus](https://litmus.com) - Email testing across clients
- [Email on Acid](https://www.emailonacid.com) - Email preview tool
- [Mail Tester](https://www.mail-tester.com) - Spam score checker

For additional support, contact the development team or refer to the main project documentation. 