import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface UsageOverviewCardsProps {
    creditsUsed: number;
    creditsLimit: number;
    agentsUsed: number;
    agentsLimit: number;
    loading?: boolean;
}

export function UsageOverviewCards({
    creditsUsed,
    creditsLimit,
    agentsUsed,
    agentsLimit,
    loading = false,
}: UsageOverviewCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center">
                                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const creditsPercentage = creditsLimit > 0 ? (creditsUsed / creditsLimit) * 100 : 0;
    const agentsPercentage = agentsLimit > 0 ? (agentsUsed / agentsLimit) * 100 : 0;

    const getStatusBadge = (percentage: number) => {
        if (percentage >= 100) return { variant: "destructive" as const, text: "Limit Reached" };
        if (percentage >= 90) return { variant: "destructive" as const, text: "Critical" };
        if (percentage >= 75) return { variant: "secondary" as const, text: "Warning" };
        return { variant: "secondary" as const, text: "Normal" };
    };

    const creditsStatus = getStatusBadge(creditsPercentage);
    const agentsStatus = getStatusBadge(agentsPercentage);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Credits Usage Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Credits Usage</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <CircularProgress
                        value={Math.min(creditsPercentage, 100)}
                        size={120}
                        strokeWidth={8}
                        className="mb-2"
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {creditsUsed}
                                <span className="text-lg text-gray-500">/{creditsLimit}</span>
                            </div>
                        </div>
                    </CircularProgress>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Credits used</p>
                        <Badge variant={creditsStatus.variant} className="text-xs">
                            {creditsStatus.text}
                        </Badge>
                        {creditsPercentage >= 80 && (
                            <div className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{creditsPercentage.toFixed(0)}% used</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Agents Usage Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Agents Usage</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <CircularProgress
                        value={Math.min(agentsPercentage, 100)}
                        size={120}
                        strokeWidth={8}
                        className="mb-2"
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {agentsUsed}
                                <span className="text-lg text-gray-500">/{agentsLimit}</span>
                            </div>
                        </div>
                    </CircularProgress>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Agents used</p>
                        <Badge variant={agentsStatus.variant} className="text-xs">
                            {agentsStatus.text}
                        </Badge>
                        {agentsPercentage >= 80 && (
                            <div className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{agentsPercentage.toFixed(0)}% used</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 