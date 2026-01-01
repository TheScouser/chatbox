import { createFileRoute } from "@tanstack/react-router";
import {
	CTASection,
	FeaturesSection,
	Footer,
	HeroSection,
	HowItWorksSection,
	Navbar,
	PricingSection,
	SocialProofSection,
	TestimonialsSection,
} from "@/components/marketing";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-white dark:bg-background">
			<Navbar />
			<HeroSection />
			<SocialProofSection />
			<FeaturesSection />
			<HowItWorksSection />
			<PricingSection />
			<TestimonialsSection />
			<CTASection />
			<Footer />
		</div>
	);
}
