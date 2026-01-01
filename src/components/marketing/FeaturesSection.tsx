import {
    BarChart3,
    Bot,
    Globe,
    MessageSquare,
    Shield,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: Bot,
        title: "Smart AI Training",
        description:
            "Upload documents, websites, or text to train your AI agent with your specific knowledge base.",
        color: "blue",
    },
    {
        icon: MessageSquare,
        title: "Natural Conversations",
        description:
            "Advanced language models ensure human-like conversations that engage and convert visitors.",
        color: "purple",
    },
    {
        icon: Zap,
        title: "Instant Setup",
        description:
            "Get your AI agent up and running in minutes with our intuitive drag-and-drop builder.",
        color: "yellow",
    },
    {
        icon: Globe,
        title: "Multi-Platform",
        description:
            "Deploy your agent on websites, social media, messaging apps, and more with one click.",
        color: "green",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
            "Track conversations, measure performance, and optimize your agent with detailed insights.",
        color: "red",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description:
            "Bank-level security with data encryption, GDPR compliance, and secure hosting.",
        color: "indigo",
    },
];

const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400" },
    green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
};

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 bg-white dark:bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
                        Everything you need to build amazing AI agents
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
                        Powerful features that make creating and managing AI chatbots
                        simple, effective, and scalable for businesses of all sizes.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => {
                        const colors = colorClasses[feature.color];
                        return (
                            <div
                                key={feature.title}
                                className="group p-8 rounded-2xl border border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border/80 hover:shadow-lg dark:hover:shadow-none transition-all duration-300"
                            >
                                <div
                                    className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                                >
                                    <feature.icon className={`w-6 h-6 ${colors.text}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
