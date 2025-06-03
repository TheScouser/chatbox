import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UsageDashboard } from "@/components/billing/UsageProgress"
import { useUserPlan, useUserSubscription } from "@/hooks/useFeatureAccess"
import { Link } from '@tanstack/react-router'
import { TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react"

export const Route = createFileRoute('/dashboard/usage')({
    component: UsagePage,
})

function UsagePage() {
    const { plan, isLoading: planLoading, isFree, planName } = useUserPlan()
    const { subscription, isLoading: subLoading } = useUserSubscription()

    if (planLoading || subLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    const formatPrice = (priceInCents: number) => {
        if (priceInCents === 0) return "Free"
        return `$${(priceInCents / 100).toFixed(0)}/month`
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-8 w-8" />
                    Usage & Analytics
                </h1>
                <p className="text-gray-600 mt-2">
                    Monitor your current usage and track your consumption across all features
                </p>
            </div>

            {/* Current Plan Info */}
            <div className="mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Current Plan: {planName}</span>
                            <Badge variant={isFree ? "secondary" : "default"}>
                                {plan ? formatPrice(plan.price) : "Free"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {subscription && (
                                <>
                                    Billing period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </>
                            )}
                            {isFree && "Start with our free plan and upgrade when you're ready to scale"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600">Plan Limits</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">{plan?.features.maxAgents || 1}</span>
                                        <span className="text-gray-500"> agents</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{(plan?.features.maxMessagesPerMonth || 500).toLocaleString()}</span>
                                        <span className="text-gray-500"> messages/month</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{(plan?.features.maxKnowledgeEntries || 50).toLocaleString()}</span>
                                        <span className="text-gray-500"> knowledge entries</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{plan?.features.maxFileSizeMB || 2}</span>
                                        <span className="text-gray-500">MB max file size</span>
                                    </div>
                                </div>
                            </div>
                            <Link to="/dashboard/settings/plans">
                                <Button variant="outline" size="sm">
                                    <ArrowUpRight className="h-4 w-4 mr-1" />
                                    {isFree ? "Upgrade Plan" : "Change Plan"}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Dashboard */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Real-time Usage</h2>
                <UsageDashboard />
            </div>

            {/* Usage Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Trends</CardTitle>
                        <CardDescription>Your usage patterns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>Usage analytics coming soon</p>
                            <p className="text-sm">We're building detailed usage insights for you</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Optimization Tips</CardTitle>
                        <CardDescription>Get the most out of your current plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isFree ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium">Maximize your free agent</p>
                                        <p className="text-sm text-gray-600">Upload diverse knowledge sources to make your agent more capable</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium">Optimize your knowledge base</p>
                                        <p className="text-sm text-gray-600">Keep your content focused and relevant for better responses</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium">Ready to scale?</p>
                                        <p className="text-sm text-gray-600">Upgrade to create multiple specialized agents</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium">Distribute your load</p>
                                        <p className="text-sm text-gray-600">Create specialized agents for different use cases</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium">Monitor performance</p>
                                        <p className="text-sm text-gray-600">Use analytics to understand which agents are most effective</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upgrade CTA for Free Users */}
            {isFree && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Approaching your limits?
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            Upgrade to unlock more capacity and premium features for your growing needs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/dashboard/settings/plans">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                View Plans & Pricing
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 