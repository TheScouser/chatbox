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
        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
                        How it works
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
                        Create your AI agent in three simple steps and start engaging
                        customers immediately.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.step} className="relative">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 dark:bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                                    {step.step}
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                                    <step.icon className="w-6 h-6 text-blue-600 dark:text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                            {index < 2 && (
                                <div className="hidden md:block absolute top-8 left-full w-full">
                                    <ChevronRight className="w-6 h-6 text-gray-400 dark:text-muted-foreground mx-auto" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
