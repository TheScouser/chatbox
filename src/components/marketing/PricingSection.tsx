import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for trying out AI agents",
        features: [
            "1 AI agent",
            "100 conversations/month",
            "Basic customization",
            "Email support",
            "Standard AI models",
        ],
        cta: "Get Started Free",
        popular: false,
    },
    {
        name: "Professional",
        price: "$29",
        period: "per month",
        description: "Best for growing businesses",
        features: [
            "5 AI agents",
            "2,000 conversations/month",
            "Advanced customization",
            "Priority support",
            "GPT-4 access",
            "Analytics dashboard",
            "Custom branding",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "pricing",
        description: "For large organizations",
        features: [
            "Unlimited agents",
            "Unlimited conversations",
            "White-label solution",
            "Dedicated support",
            "Custom integrations",
            "Advanced security",
            "SLA guarantee",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-20 bg-white dark:bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
                        Choose the perfect plan for your business. Start free and scale as
                        you grow.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 rounded-2xl border-2 ${plan.popular
                                    ? "border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/5"
                                    : "border-gray-200 dark:border-border bg-white dark:bg-card"
                                } hover:shadow-lg transition-all duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-600 dark:bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-foreground">
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className="text-gray-600 dark:text-muted-foreground ml-2">
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-muted-foreground">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center">
                                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Unauthenticated>
                                <SignInButton>
                                    <Button
                                        className={`w-full ${plan.popular
                                                ? "bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white"
                                                : "bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-900 dark:text-foreground"
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </SignInButton>
                            </Unauthenticated>
                            <Authenticated>
                                <Link to="/dashboard/agents">
                                    <Button
                                        className={`w-full ${plan.popular
                                                ? "bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white"
                                                : "bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/80 text-gray-900 dark:text-foreground"
                                            }`}
                                    >
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </Authenticated>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
