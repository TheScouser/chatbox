import { Star } from "lucide-react";

const testimonials = [
    {
        quote:
            "ChatBox helped us reduce support tickets by 70% while improving customer satisfaction. The AI agent handles routine questions perfectly, letting our team focus on complex issues.",
        author: "Sarah Johnson",
        role: "Customer Success Manager",
        company: "TechCorp",
        rating: 5,
    },
    {
        quote:
            "Implementation was incredibly smooth. Within a week, we had a fully functional AI agent that understood our products and could guide customers through purchases.",
        author: "Mike Chen",
        role: "E-commerce Director",
        company: "ShopPlus",
        rating: 5,
    },
    {
        quote:
            "The analytics insights are game-changing. We can see exactly what customers are asking about and optimize our agent's responses for better conversions.",
        author: "Emily Rodriguez",
        role: "Marketing Manager",
        company: "GrowthCo",
        rating: 5,
    },
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-20 bg-gray-50 dark:bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
                        Loved by businesses worldwide
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
                        See how companies are using ChatBox to transform their customer
                        experience.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.author}
                            className="bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-border"
                        >
                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={`star-${testimonial.author}-${i}`}
                                        className="w-5 h-5 text-yellow-400 fill-current"
                                    />
                                ))}
                            </div>
                            <blockquote className="text-gray-700 dark:text-foreground mb-6 leading-relaxed">
                                "{testimonial.quote}"
                            </blockquote>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                                    {testimonial.author
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-foreground">
                                        {testimonial.author}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                        {testimonial.role} at {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
