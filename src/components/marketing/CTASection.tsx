import { SignInButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight } from "lucide-react";

export function CTASection() {
	return (
		<section className="py-20 bg-gradient-to-r from-primary to-purple-600 relative overflow-hidden">
			<div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
				<h2 className="text-4xl font-bold text-primary-foreground mb-6">
					Ready to transform your customer experience?
				</h2>
				<p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
					Join thousands of businesses using ChatBox to engage customers,
					generate leads, and provide 24/7 support with intelligent AI agents.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Unauthenticated>
						<SignInButton>
							<button
								type="button"
								className="inline-flex items-center justify-center px-8 py-4 bg-background text-primary font-semibold rounded-lg hover:bg-background/90 transition-colors shadow-lg"
							>
								Start Your Free Trial
								<ArrowRight className="w-5 h-5 ml-2" />
							</button>
						</SignInButton>
					</Unauthenticated>
					<Authenticated>
						<Link
							to="/dashboard/agents"
							className="inline-flex items-center justify-center px-8 py-4 bg-background text-primary font-semibold rounded-lg hover:bg-background/90 transition-colors shadow-lg"
						>
							Go to Dashboard
							<ArrowRight className="w-5 h-5 ml-2" />
						</Link>
					</Authenticated>
					<button
						type="button"
						className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition-colors"
					>
						Schedule a Demo
					</button>
				</div>
				<p className="text-primary-foreground/80 text-sm mt-4">
					No credit card required • 14-day free trial • Setup in 5 minutes
				</p>
			</div>
		</section>
	);
}

export function SocialProofSection() {
	return (
		<section className="py-12 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8">
					<p className="text-muted-foreground font-medium">
						Trusted by 10,000+ businesses worldwide
					</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-12 bg-muted rounded-lg flex items-center justify-center border border-border/50"
						>
							<span className="text-muted-foreground font-semibold">
								Company {i}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
