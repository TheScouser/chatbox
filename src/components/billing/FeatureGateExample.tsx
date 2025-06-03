import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Lock, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface FeatureGateProps {
    feature: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
    const { hasAccess, loading, suggestedPlan } = useFeatureAccess(feature);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 rounded h-20" />;
    }

    if (!hasAccess) {
        return fallback || (
            <Card className="border-dashed border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <Lock className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Premium Feature</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">
                        Upgrade to {suggestedPlan} plan to unlock this feature
                    </p>
                    <Link to="/dashboard/billing/plans">
                        <Button size="sm">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade Plan
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return <>{children}</>;
}

// Example usage components
export function CustomDomainsExample() {
    return (
        <FeatureGate feature="custom_domains">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Custom Domains
                        <Badge variant="secondary">Pro Feature</Badge>
                    </CardTitle>
                    <CardDescription>
                        Use your own domain for your chatbot widget
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Domain</label>
                            <input
                                type="text"
                                placeholder="chat.yourdomain.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <Button>Save Domain</Button>
                    </div>
                </CardContent>
            </Card>
        </FeatureGate>
    );
}

export function AdvancedAnalyticsExample() {
    return (
        <FeatureGate feature="advanced_analytics">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Advanced Analytics
                        <Badge variant="secondary">Standard+ Feature</Badge>
                    </CardTitle>
                    <CardDescription>
                        Detailed insights into your chatbot performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">1,234</div>
                            <div className="text-sm text-gray-600">Total Conversations</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">89%</div>
                            <div className="text-sm text-gray-600">Satisfaction Rate</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </FeatureGate>
    );
} 