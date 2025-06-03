import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlanFeatures {
    maxAgents: number;
    maxKnowledgeEntries: number;
    maxMessagesPerMonth: number;
    maxFileUploads: number;
    maxFileSizeMB: number;
    prioritySupport: boolean;
    customDomains: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    webhookIntegrations: boolean;
    customBranding: boolean;
    ssoIntegration: boolean;
    auditLogs: boolean;
}

interface PlanCardProps {
    name: string;
    price: number;
    features: PlanFeatures;
    isCurrentPlan?: boolean;
    isPopular?: boolean;
    onSelectPlan?: () => void;
    loading?: boolean;
}

export function PlanCard({
    name,
    price,
    features,
    isCurrentPlan = false,
    isPopular = false,
    onSelectPlan,
    loading = false
}: PlanCardProps) {
    const formatPrice = (priceInCents: number) => {
        if (priceInCents === 0) return "Free";
        return `$${(priceInCents / 100).toFixed(0)}/month`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const coreFeatures = [
        { label: "Agents", value: formatNumber(features.maxAgents) },
        { label: "Knowledge Entries", value: formatNumber(features.maxKnowledgeEntries) },
        { label: "Messages/Month", value: formatNumber(features.maxMessagesPerMonth) },
        { label: "File Uploads", value: formatNumber(features.maxFileUploads) },
        { label: "Max File Size", value: `${features.maxFileSizeMB}MB` },
    ];

    const premiumFeatures = [
        { key: "prioritySupport", label: "Priority Support", enabled: features.prioritySupport },
        { key: "customDomains", label: "Custom Domains", enabled: features.customDomains },
        { key: "advancedAnalytics", label: "Advanced Analytics", enabled: features.advancedAnalytics },
        { key: "apiAccess", label: "API Access", enabled: features.apiAccess },
        { key: "webhookIntegrations", label: "Webhook Integrations", enabled: features.webhookIntegrations },
        { key: "customBranding", label: "Custom Branding", enabled: features.customBranding },
        { key: "ssoIntegration", label: "SSO Integration", enabled: features.ssoIntegration },
        { key: "auditLogs", label: "Audit Logs", enabled: features.auditLogs },
    ];

    return (
        <Card className={`relative ${isPopular ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
            {isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                </Badge>
            )}

            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {name}
                    {isCurrentPlan && (
                        <Badge variant="secondary">Current Plan</Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-3xl font-bold">
                    {formatPrice(price)}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Core Features */}
                <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-600">Limits</h4>
                    {coreFeatures.map((feature, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span>{feature.label}</span>
                            <span className="font-medium">{feature.value}</span>
                        </div>
                    ))}
                </div>

                {/* Premium Features */}
                <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-600">Features</h4>
                    {premiumFeatures.map((feature) => (
                        <div key={feature.key} className="flex items-center gap-2 text-sm">
                            <Check
                                className={`h-4 w-4 ${feature.enabled ? 'text-green-500' : 'text-gray-300'}`}
                            />
                            <span className={feature.enabled ? '' : 'text-gray-400'}>
                                {feature.label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter>
                {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                        Current Plan
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        onClick={onSelectPlan}
                        disabled={loading}
                        variant={isPopular ? "default" : "outline"}
                    >
                        {loading ? "Loading..." : `Choose ${name}`}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
} 