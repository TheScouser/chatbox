import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import {
	ArrowRight,
	BarChart3,
	Bot,
	Check,
	ChevronRight,
	Clock,
	Globe,
	Menu,
	MessageSquare,
	Play,
	Shield,
	Sparkles,
	Star,
	TrendingUp,
	Users,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex items-center">
							<Link to="/" className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
									<Bot className="w-5 h-5 text-white" />
								</div>
								<span className="text-xl font-bold text-gray-900">ChatBox</span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-8">
							<a
								href="#features"
								className="text-gray-600 hover:text-gray-900 transition-colors"
							>
								Features
							</a>
							<a
								href="#how-it-works"
								className="text-gray-600 hover:text-gray-900 transition-colors"
							>
								How it Works
							</a>
							<a
								href="#pricing"
								className="text-gray-600 hover:text-gray-900 transition-colors"
							>
								Pricing
							</a>
							<a
								href="#testimonials"
								className="text-gray-600 hover:text-gray-900 transition-colors"
							>
								Testimonials
							</a>
						</div>

						{/* CTA Buttons */}
						<div className="hidden md:flex items-center space-x-4">
							<Unauthenticated>
								<SignInButton>
									<button className="text-gray-600 hover:text-gray-900 transition-colors">
										Sign In
									</button>
								</SignInButton>
								<SignInButton>
									<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
										Get Started Free
									</button>
								</SignInButton>
							</Unauthenticated>
							<Authenticated>
								<Link
									to="/dashboard/agents"
									className="text-gray-600 hover:text-gray-900 transition-colors"
								>
									Dashboard
								</Link>
								<UserButton />
							</Authenticated>
						</div>

						{/* Mobile menu button */}
						<button
							className="md:hidden"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="w-6 h-6 text-gray-600" />
							) : (
								<Menu className="w-6 h-6 text-gray-600" />
							)}
						</button>
					</div>

					{/* Mobile Navigation */}
					{mobileMenuOpen && (
						<div className="md:hidden py-4 border-t border-gray-200">
							<div className="flex flex-col space-y-4">
								<a
									href="#features"
									className="text-gray-600 hover:text-gray-900"
								>
									Features
								</a>
								<a
									href="#how-it-works"
									className="text-gray-600 hover:text-gray-900"
								>
									How it Works
								</a>
								<a
									href="#pricing"
									className="text-gray-600 hover:text-gray-900"
								>
									Pricing
								</a>
								<a
									href="#testimonials"
									className="text-gray-600 hover:text-gray-900"
								>
									Testimonials
								</a>
								<div className="pt-4 border-t border-gray-200">
									<Unauthenticated>
										<SignInButton>
											<button className="block text-gray-600 hover:text-gray-900 mb-2 w-full text-left">
												Sign In
											</button>
										</SignInButton>
										<SignInButton>
											<button className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center w-full">
												Get Started Free
											</button>
										</SignInButton>
									</Unauthenticated>
									<Authenticated>
										<Link
											to="/dashboard/agents"
											className="block text-gray-600 hover:text-gray-900 mb-2"
										>
											Dashboard
										</Link>
										<div className="flex justify-center">
											<UserButton />
										</div>
									</Authenticated>
								</div>
							</div>
						</div>
					)}
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<div className="space-y-4">
								<div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
									<Sparkles className="w-4 h-4 mr-2" />
									AI-Powered Customer Support
								</div>
								<h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
									Build Intelligent
									<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
										{" "}
										AI Agents{" "}
									</span>
									in Minutes
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									Create custom AI chatbots that understand your business,
									engage customers 24/7, and convert visitors into leads. No
									coding required.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Unauthenticated>
									<SignInButton>
										<button className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
											Start Building for Free
											<ArrowRight className="w-5 h-5 ml-2" />
										</button>
									</SignInButton>
								</Unauthenticated>
								<Authenticated>
									<Link
										to="/dashboard/agents"
										className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
									>
										Go to Dashboard
										<ArrowRight className="w-5 h-5 ml-2" />
									</Link>
								</Authenticated>
								<button className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
									<Play className="w-5 h-5 mr-2" />
									Watch Demo
								</button>
							</div>

							<div className="flex items-center space-x-8 text-sm text-gray-600">
								<div className="flex items-center">
									<Check className="w-4 h-4 text-green-500 mr-2" />
									Free 14-day trial
								</div>
								<div className="flex items-center">
									<Check className="w-4 h-4 text-green-500 mr-2" />
									No credit card required
								</div>
								<div className="flex items-center">
									<Check className="w-4 h-4 text-green-500 mr-2" />
									Setup in 5 minutes
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="relative bg-white rounded-2xl shadow-2xl p-6">
								{/* Chat Interface Mockup */}
								<div className="space-y-4">
									<div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
										<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
											<Bot className="w-6 h-6 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Sales Assistant
											</h3>
											<p className="text-sm text-green-500">● Online</p>
										</div>
									</div>

									<div className="space-y-3">
										<div className="flex justify-start">
											<div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
												<p className="text-sm text-gray-800">
													Hi! I'm here to help you find the perfect solution for
													your business. What are you looking for?
												</p>
											</div>
										</div>

										<div className="flex justify-end">
											<div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
												<p className="text-sm">
													I need a chatbot for my e-commerce store
												</p>
											</div>
										</div>

										<div className="flex justify-start">
											<div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
												<p className="text-sm text-gray-800">
													Perfect! I can help you set up an AI agent that
													handles customer inquiries, processes orders, and
													provides 24/7 support. Would you like to see a demo?
												</p>
											</div>
										</div>
									</div>

									<div className="flex items-center space-x-2 pt-2">
										<div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
											<p className="text-sm text-gray-500">
												Type your message...
											</p>
										</div>
										<button className="bg-blue-600 text-white p-2 rounded-lg">
											<ArrowRight className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Floating Stats */}
							<div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
								<div className="flex items-center space-x-2">
									<TrendingUp className="w-5 h-5 text-green-500" />
									<div>
										<p className="text-sm font-semibold text-gray-900">+127%</p>
										<p className="text-xs text-gray-600">Conversion Rate</p>
									</div>
								</div>
							</div>

							<div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4">
								<div className="flex items-center space-x-2">
									<Clock className="w-5 h-5 text-blue-500" />
									<div>
										<p className="text-sm font-semibold text-gray-900">24/7</p>
										<p className="text-xs text-gray-600">Always Available</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Social Proof */}
			<section className="py-12 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-8">
						<p className="text-gray-600">
							Trusted by 10,000+ businesses worldwide
						</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
						{/* Placeholder for company logos */}
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="h-12 bg-gray-300 rounded-lg flex items-center justify-center"
							>
								<span className="text-gray-500 font-semibold">Company {i}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Everything you need to build amazing AI agents
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Powerful features that make creating and managing AI chatbots
							simple, effective, and scalable for businesses of all sizes.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
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
						].map((feature, index) => (
							<div
								key={index}
								className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
							>
								<div
									className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
								>
									<feature.icon
										className={`w-6 h-6 text-${feature.color}-600`}
									/>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section id="how-it-works" className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							How it works
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Create your AI agent in three simple steps and start engaging
							customers immediately.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
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
						].map((step, index) => (
							<div key={index} className="relative">
								<div className="text-center">
									<div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
										{step.step}
									</div>
									<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
										<step.icon className="w-6 h-6 text-blue-600" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900 mb-4">
										{step.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{step.description}
									</p>
								</div>
								{index < 2 && (
									<div className="hidden md:block absolute top-8 left-full w-full">
										<ChevronRight className="w-6 h-6 text-gray-400 mx-auto" />
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section id="pricing" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Simple, transparent pricing
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Choose the perfect plan for your business. Start free and scale as
							you grow.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
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
						].map((plan, index) => (
							<div
								key={index}
								className={`relative p-8 rounded-2xl border-2 ${plan.popular ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"} hover:shadow-lg transition-all duration-300`}
							>
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
											Most Popular
										</span>
									</div>
								)}

								<div className="text-center mb-8">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										{plan.name}
									</h3>
									<div className="mb-4">
										<span className="text-4xl font-bold text-gray-900">
											{plan.price}
										</span>
										{plan.period && (
											<span className="text-gray-600 ml-2">{plan.period}</span>
										)}
									</div>
									<p className="text-gray-600">{plan.description}</p>
								</div>

								<ul className="space-y-4 mb-8">
									{plan.features.map((feature, featureIndex) => (
										<li key={featureIndex} className="flex items-center">
											<Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>

								<Unauthenticated>
									<SignInButton>
										<Button
											className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
										>
											{plan.cta}
										</Button>
									</SignInButton>
								</Unauthenticated>
								<Authenticated>
									<Link to="/dashboard/agents">
										<Button
											className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
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

			{/* Testimonials Section */}
			<section id="testimonials" className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Loved by businesses worldwide
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							See how companies are using ChatBox to transform their customer
							experience.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
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
						].map((testimonial, index) => (
							<div
								key={index}
								className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
							>
								<div className="flex items-center mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star
											key={i}
											className="w-5 h-5 text-yellow-400 fill-current"
										/>
									))}
								</div>
								<blockquote className="text-gray-700 mb-6 leading-relaxed">
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
										<p className="font-semibold text-gray-900">
											{testimonial.author}
										</p>
										<p className="text-sm text-gray-600">
											{testimonial.role} at {testimonial.company}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
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
								<button className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
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
						<button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
							Schedule a Demo
						</button>
					</div>
					<p className="text-blue-100 text-sm mt-4">
						No credit card required • 14-day free trial • Setup in 5 minutes
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-4 gap-8">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
									<Bot className="w-5 h-5 text-white" />
								</div>
								<span className="text-xl font-bold">ChatBox</span>
							</div>
							<p className="text-gray-400 leading-relaxed">
								Build intelligent AI agents that engage customers and grow your
								business.
							</p>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Product</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Features
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Pricing
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Integrations
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										API
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Company</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										About
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Blog
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Careers
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Contact
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Support</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Help Center
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Documentation
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Community
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Status
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-400 text-sm">
							© 2024 ChatBox. All rights reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<a
								href="#"
								className="text-gray-400 hover:text-white text-sm transition-colors"
							>
								Privacy Policy
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white text-sm transition-colors"
							>
								Terms of Service
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white text-sm transition-colors"
							>
								Cookie Policy
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
