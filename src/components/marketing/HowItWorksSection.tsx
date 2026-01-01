import { Bot, ChevronRight, Globe, Sparkles } from "lucide-react";

const steps = [
	{
		step: "01",
		title: "Train Your Agent",
		description:
			"Upload your knowledge base, website content, or documents. Our AI learns your business inside and out.",
		icon: Bot,
	},
	{
		step: "02",
		title: "Customize & Configure",
		description:
			"Design your agent's personality, appearance, and conversation flows to match your brand perfectly.",
		icon: Sparkles,
	},
	{
		step: "03",
		title: "Deploy Everywhere",
		description:
			"Embed your agent on your website, social media, or messaging platforms with a simple code snippet.",
		icon: Globe,
	},
];

export function HowItWorksSection() {
	return (
		<section id="how-it-works" className="py-20 bg-muted/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16 animate-fade-in-up">
					<h2 className="text-4xl font-bold text-foreground mb-4">
						How it works
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Create your AI agent in three simple steps and start engaging
						customers immediately.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{steps.map((step, index) => (
						<div key={step.step} className="relative group">
							<div className="text-center p-6 rounded-2xl hover:bg-card transition-colors duration-300">
								<div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
									{step.step}
								</div>
								<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-6">
									<step.icon className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-4">
									{step.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{step.description}
								</p>
							</div>
							{index < 2 && (
								<div className="hidden md:block absolute top-1/2 left-full w-full transform -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none">
									<ChevronRight className="w-6 h-6 text-muted-foreground/30 mx-auto" />
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
