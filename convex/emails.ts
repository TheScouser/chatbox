import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Initialize Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Send welcome email when user signs up
export const sendWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured, skipping welcome email");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "AI Agent Platform <onboarding@yourdomain.com>",
        to: [args.to],
        subject: "Welcome to AI Agent Platform! 🤖",
        html: generateWelcomeEmailHTML(args.name),
      });

      if (error) {
        console.error("Failed to send welcome email:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Send billing notification (payment success, failure, etc.)
export const sendBillingNotification = internalAction({
  args: {
    to: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("subscription_cancelled"),
      v.literal("trial_ending"),
      v.literal("plan_upgraded"),
      v.literal("plan_downgraded")
    ),
    planName: v.optional(v.string()),
    amount: v.optional(v.number()),
    nextBillingDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured, skipping billing notification");
      return { success: false, error: "Email service not configured" };
    }

    const emailContent = generateBillingNotificationHTML(args);

    try {
      const { data, error } = await resend.emails.send({
        from: "AI Agent Platform <billing@yourdomain.com>",
        to: [args.to],
        subject: getBillingEmailSubject(args.type),
        html: emailContent,
      });

      if (error) {
        console.error("Failed to send billing notification:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending billing notification:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Send usage alert when approaching limits
export const sendUsageAlert = internalAction({
  args: {
    to: v.string(),
    name: v.string(),
    metric: v.string(),
    currentUsage: v.number(),
    limit: v.number(),
    percentUsed: v.number(),
    planName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured, skipping usage alert");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "AI Agent Platform <alerts@yourdomain.com>",
        to: [args.to],
        subject: `⚠️ Usage Alert: ${args.metric} at ${Math.round(args.percentUsed)}%`,
        html: generateUsageAlertHTML(args),
      });

      if (error) {
        console.error("Failed to send usage alert:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending usage alert:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Send general notification (product updates, announcements, etc.)
export const sendGeneralNotification = action({
  args: {
    to: v.string(),
    name: v.string(),
    subject: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("product_update"),
      v.literal("announcement"),
      v.literal("maintenance"),
      v.literal("newsletter")
    ),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured, skipping general notification");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "AI Agent Platform <updates@yourdomain.com>",
        to: [args.to],
        subject: args.subject,
        html: generateGeneralNotificationHTML(args),
      });

      if (error) {
        console.error("Failed to send general notification:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending general notification:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Send organization invitation email
export const sendOrganizationInvitationEmail = internalAction({
  args: {
    to: v.string(),
    organizationName: v.string(),
    inviterName: v.string(),
    role: v.string(),
    invitationToken: v.string(),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured, skipping organization invitation");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "AI Agent Platform <invitations@yourdomain.com>",
        to: [args.to],
        subject: `You've been invited to join ${args.organizationName}`,
        html: generateOrganizationInvitationHTML(args),
      });

      if (error) {
        console.error("Failed to send organization invitation:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Error sending organization invitation:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Helper functions for generating email content

function generateWelcomeEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AI Agent Platform</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .highlight-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🤖 Welcome to AI Agent Platform!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Build powerful AI agents in minutes</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          
          <p>Welcome to AI Agent Platform! We're excited to have you join our community of builders creating intelligent AI agents.</p>
          
          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #1e40af;">🚀 Get Started</h3>
            <p style="margin-bottom: 0;">You're ready to create your first AI agent! Your free plan includes:</p>
            <ul style="margin: 10px 0;">
              <li>1 AI agent</li>
              <li>50 knowledge entries</li>
              <li>500 messages per month</li>
              <li>5 file uploads</li>
            </ul>
          </div>
          
          <a href="${process.env.SERVER_URL || 'https://yourapp.com'}/dashboard/agents/new" class="button">Create Your First Agent</a>
          
          <h3>🎯 What's Next?</h3>
          <ul>
            <li><strong>Upload Knowledge:</strong> Add documents, FAQs, or data to train your agent</li>
            <li><strong>Customize Behavior:</strong> Define how your agent responds and interacts</li>
            <li><strong>Test & Deploy:</strong> Try your agent and deploy it to your website</li>
          </ul>
          
          <p>Need help? Check out our <a href="${process.env.SERVER_URL || 'https://yourapp.com'}/docs">documentation</a> or reply to this email.</p>
          
          <p>Happy building!<br>
          The AI Agent Platform Team</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you signed up for AI Agent Platform.</p>
          <p>AI Agent Platform | San Francisco, CA</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBillingNotificationHTML(args: any): string {
  const { name, type, planName, amount, nextBillingDate } = args;
  
  const typeConfig = {
    payment_success: {
      title: "Payment Successful! 🎉",
      message: `Your payment of $${amount ? (amount / 100).toFixed(2) : '0.00'} for the ${planName} plan has been processed successfully.`,
      color: "#10b981",
      icon: "✅"
    },
    payment_failed: {
      title: "Payment Failed ⚠️",
      message: `We couldn't process your payment for the ${planName} plan. Please update your payment method to continue your subscription.`,
      color: "#ef4444",
      icon: "❌"
    },
    subscription_cancelled: {
      title: "Subscription Cancelled",
      message: `Your ${planName} subscription has been cancelled. You'll continue to have access until your current billing period ends.`,
      color: "#f59e0b",
      icon: "🔄"
    },
    plan_upgraded: {
      title: "Plan Upgraded! 🚀",
      message: `Welcome to the ${planName} plan! You now have access to more features and higher limits.`,
      color: "#8b5cf6",
      icon: "⬆️"
    },
    plan_downgraded: {
      title: "Plan Changed",
      message: `Your plan has been changed to ${planName}. Changes will take effect on your next billing cycle.`,
      color: "#6b7280",
      icon: "⬇️"
    },
    trial_ending: {
      title: "Trial Ending Soon",
      message: `Your trial period ends soon. Upgrade to ${planName} to continue using all features.`,
      color: "#f59e0b",
      icon: "⏰"
    }
  };

  const config = typeConfig[type as keyof typeof typeConfig];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Billing Notification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: ${config.color}; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${config.icon} ${config.title}</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${name}!</h2>
          
          <p>${config.message}</p>
          
          ${nextBillingDate ? `
          <div class="info-box">
            <strong>Next Billing Date:</strong> ${nextBillingDate}
          </div>
          ` : ''}
          
          <a href="${process.env.SERVER_URL || 'https://yourapp.com'}/dashboard/settings/billing" class="button">Manage Billing</a>
          
          <p>If you have any questions about your billing, don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>
          The AI Agent Platform Team</p>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at billing@yourdomain.com</p>
          <p>AI Agent Platform | San Francisco, CA</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUsageAlertHTML(args: any): string {
  const { name, metric, currentUsage, limit, percentUsed, planName } = args;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Usage Alert</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .usage-bar { background-color: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .usage-fill { background-color: ${percentUsed >= 90 ? '#ef4444' : percentUsed >= 75 ? '#f59e0b' : '#3b82f6'}; height: 100%; transition: width 0.3s ease; }
        .stats { background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Usage Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You're approaching your plan limits</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}!</h2>
          
          <p>Your <strong>${metric}</strong> usage is approaching the limit on your <strong>${planName}</strong> plan.</p>
          
          <div class="stats">
            <h3 style="margin-top: 0; color: #92400e;">Current Usage</h3>
            <p style="font-size: 18px; margin: 5px 0;"><strong>${currentUsage.toLocaleString()}</strong> of <strong>${limit.toLocaleString()}</strong> ${metric}</p>
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${Math.min(percentUsed, 100)}%"></div>
            </div>
            <p style="text-align: center; margin: 10px 0 0 0; font-weight: 600; color: ${percentUsed >= 90 ? '#dc2626' : percentUsed >= 75 ? '#d97706' : '#2563eb'};">
              ${Math.round(percentUsed)}% used
            </p>
          </div>
          
          <p>To continue using all features without interruption, consider upgrading your plan:</p>
          
          <a href="${process.env.SERVER_URL || 'https://yourapp.com'}/dashboard/settings/plans" class="button">Upgrade Plan</a>
          
          <p><strong>Need help optimizing your usage?</strong></p>
          <ul>
            <li>Review your <a href="${process.env.SERVER_URL || 'https://yourapp.com'}/dashboard/usage">usage dashboard</a></li>
            <li>Check our <a href="#">optimization tips</a></li>
            <li>Contact support for personalized advice</li>
          </ul>
          
          <p>Best regards,<br>
          The AI Agent Platform Team</p>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at support@yourdomain.com</p>
          <p>AI Agent Platform | San Francisco, CA</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateGeneralNotificationHTML(args: any): string {
  const { name, content, type } = args;
  
  const typeConfig = {
    product_update: { color: "#3b82f6", icon: "🚀" },
    announcement: { color: "#8b5cf6", icon: "📢" },
    maintenance: { color: "#f59e0b", icon: "🔧" },
    newsletter: { color: "#10b981", icon: "📰" }
  };
  
  const config = typeConfig[type as keyof typeof typeConfig];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Agent Platform Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: ${config.color}; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${config.icon} AI Agent Platform</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${name}!</h2>
          
          <div>${content}</div>
          
          <p>Best regards,<br>
          The AI Agent Platform Team</p>
        </div>
        
        <div class="footer">
          <p>AI Agent Platform | San Francisco, CA</p>
          <p><a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Update Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getBillingEmailSubject(type: string): string {
  const subjects = {
    payment_success: "Payment Successful - AI Agent Platform",
    payment_failed: "Payment Failed - Action Required",
    subscription_cancelled: "Subscription Cancelled - AI Agent Platform", 
    trial_ending: "Trial Ending Soon - Upgrade Now",
    plan_upgraded: "Plan Upgraded Successfully!",
    plan_downgraded: "Plan Changed - AI Agent Platform"
  };
  
  return subjects[type as keyof typeof subjects] || "Billing Notification - AI Agent Platform";
}

function generateOrganizationInvitationHTML(args: any): string {
  const { organizationName, inviterName, role, invitationToken } = args;
  const invitationUrl = `${process.env.SERVER_URL || 'https://yourapp.com'}/invitations/accept?token=${invitationToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Organization Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
        .footer { background-color: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .invitation-box { background-color: #eff6ff; border: 2px solid #3b82f6; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center; }
        .role-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: capitalize; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🤝 You're Invited!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Join an organization on AI Agent Platform</p>
        </div>
        
        <div class="content">
          <h2>Hi there! 👋</h2>
          
          <p><strong>${inviterName}</strong> has invited you to join the <strong>${organizationName}</strong> organization on AI Agent Platform.</p>
          
          <div class="invitation-box">
            <h3 style="margin-top: 0; color: #1e40af;">Organization: ${organizationName}</h3>
            <p style="margin: 10px 0;">Your role: <span class="role-badge">${role}</span></p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">You'll be able to collaborate with your team and access shared AI agents.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> This invitation will expire in 7 days. If you don't have an account yet, you'll be prompted to create one when you accept the invitation.
          </p>
          
          <h3>What you can do as a ${role}:</h3>
          <ul>
            ${role === 'admin' ? `
              <li>Manage organization members and settings</li>
              <li>Create and edit AI agents</li>
              <li>Access all organization data and analytics</li>
              <li>Invite new team members</li>
            ` : role === 'editor' ? `
              <li>Create and edit AI agents</li>
              <li>Access organization data and analytics</li>
              <li>Collaborate with team members</li>
            ` : `
              <li>View AI agents and analytics</li>
              <li>Collaborate with team members</li>
              <li>Access shared resources (read-only)</li>
            `}
          </ul>
          
          <p>Questions about this invitation? Feel free to reach out to ${inviterName} or our support team.</p>
          
          <p>Best regards,<br>
          The AI Agent Platform Team</p>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at support@yourdomain.com</p>
          <p>AI Agent Platform | San Francisco, CA</p>
          <p style="margin-top: 12px; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
} 