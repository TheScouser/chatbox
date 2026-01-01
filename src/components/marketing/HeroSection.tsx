import { SignInButton } from "@clerk/clerk-react";

import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import {
	ArrowRight,
	Bot,
	Check,
	Clock,
	Play,
	Sparkles,
	TrendingUp,
} from "lucide-react";

export function HeroSection() {
	return (
		<section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-8 animate-fade-in-up">
						<div className="space-y-4">
							<div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
								<Sparkles className="w-4 h-4 mr-2" />
								AI-Powered Customer Support
							</div>
							<h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
								Build Intelligent
								<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
									{" "}
									AI Agents{" "}
								</span>
								in Minutes
							</h1>
							<p className="text-xl text-muted-foreground leading-relaxed">
								Create custom AI chatbots that understand your business, engage
								customers 24/7, and convert visitors into leads. No coding
								required.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Unauthenticated>
								<SignInButton>
									<button
										type="button"
										className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
									>
										Start Building for Free
										<ArrowRight className="w-5 h-5 ml-2" />
									</button>
								</SignInButton>
							</Unauthenticated>
							<Authenticated>
								<Link
									to="/dashboard/agents"
									className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
								>
									Go to Dashboard
									<ArrowRight className="w-5 h-5 ml-2" />
								</Link>
							</Authenticated>
							<button
								type="button"
								className="inline-flex items-center justify-center px-8 py-4 border border-border text-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
							>
								<Play className="w-5 h-5 mr-2" />
								Watch Demo
							</button>
						</div>

						<div className="flex items-center space-x-8 text-sm text-muted-foreground">
							<div className="flex items-center">
								<Check className="w-4 h-4 text-primary mr-2" />
								Free 14-day trial
							</div>
							<div className="flex items-center">
								<Check className="w-4 h-4 text-primary mr-2" />
								No credit card required
							</div>
							<div className="flex items-center">
								<Check className="w-4 h-4 text-primary mr-2" />
								Setup in 5 minutes
							</div>
						</div>
					</div>

					<div className="relative animate-slide-in-right">
						<ChatMockup />

						{/* Floating Stats */}
						<div className="absolute -top-4 -right-4 bg-card border border-border/50 rounded-lg shadow-xl p-4 animate-bounce-subtle">
							<div className="flex items-center space-x-2">
								<TrendingUp className="w-5 h-5 text-green-500" />
								<div>
									<p className="text-sm font-semibold text-foreground">+127%</p>
									<p className="text-xs text-muted-foreground">
										Conversion Rate
									</p>
								</div>
							</div>
						</div>

						<div className="absolute -bottom-4 -left-4 bg-card border border-border/50 rounded-lg shadow-xl p-4">
							<div className="flex items-center space-x-2">
								<Clock className="w-5 h-5 text-blue-500" />
								<div>
									<p className="text-sm font-semibold text-foreground">24/7</p>
									<p className="text-xs text-muted-foreground">
										Always Available
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ChatMockup() {
	return (
		<div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl p-6">
			<div className="space-y-4">
				<div className="flex items-center space-x-3 pb-4 border-b border-border">
					<div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
						<Bot className="w-6 h-6 text-primary-foreground" />
					</div>
					<div>
						<h3 className="font-semibold text-foreground">Sales Assistant</h3>
						<p className="text-sm text-green-500">● Online</p>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex justify-start">
						<div className="bg-muted rounded-lg px-4 py-2 max-w-xs">
							<p className="text-sm text-foreground">
								Hi! I'm here to help you find the perfect solution for your
								business. What are you looking for?
							</p>
						</div>
					</div>

					<div className="flex justify-end">
						<div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-xs">
							<p className="text-sm">
								I need a chatbot for my e-commerce store
							</p>
						</div>
					</div>

					<div className="flex justify-start">
						<div className="bg-muted rounded-lg px-4 py-2 max-w-xs">
							<p className="text-sm text-foreground">
								Perfect! I can help you set up an AI agent that handles customer
								inquiries, processes orders, and provides 24/7 support. Would
								you like to see a demo?
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-2 pt-2">
					<div className="flex-1 bg-muted rounded-lg px-3 py-2">
						<p className="text-sm text-muted-foreground">
							Type your message...
						</p>
					</div>
					<button
						type="button"
						className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors"
					>
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
