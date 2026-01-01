import { SignInButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-primary dark:to-purple-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to transform your customer experience?
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    Join thousands of businesses using ChatBox to engage customers,
                    generate leads, and provide 24/7 support with intelligent AI agents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Unauthenticated>
                        <SignInButton>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Start Your Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </SignInButton>
                    </Unauthenticated>
                    <Authenticated>
                        <Link
                            to="/dashboard/agents"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Authenticated>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                    >
                        Schedule a Demo
                    </button>
                </div>
                <p className="text-blue-100 text-sm mt-4">
                    No credit card required • 14-day free trial • Setup in 5 minutes
                </p>
            </div>
        </section>
    );
}

export function SocialProofSection() {
    return (
        <section className="py-12 bg-gray-50 dark:bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <p className="text-gray-600 dark:text-muted-foreground">
                        Trusted by 10,000+ businesses worldwide
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-12 bg-gray-300 dark:bg-muted rounded-lg flex items-center justify-center"
                        >
                            <span className="text-gray-500 dark:text-muted-foreground font-semibold">
                                Company {i}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
