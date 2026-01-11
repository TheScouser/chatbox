import { Bot } from "lucide-react";

export function Footer() {
	return (
		<footer className="bg-background text-foreground py-16 border-t border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-4 gap-8">
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
								<Bot className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="text-xl font-bold">ChatBox</span>
						</div>
						<p className="text-muted-foreground leading-relaxed">
							Build intelligent AI agents that engage customers and grow your
							business.
						</p>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-foreground">Product</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<a
									href="#features"
									className="hover:text-primary transition-colors"
								>
									Features
								</a>
							</li>
							<li>
								<a
									href="#pricing"
									className="hover:text-primary transition-colors"
								>
									Pricing
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Integrations
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									API
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-foreground">Company</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									About
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Blog
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Careers
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Contact
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="font-semibold mb-4 text-foreground">Support</h4>
						<ul className="space-y-2 text-muted-foreground">
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Help Center
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Documentation
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Status
								</a>
							</li>
							<li>
								<a href="/coming-soon" className="hover:text-primary transition-colors">
									Privacy Policy
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
					<p>&copy; {new Date().getFullYear()} ChatBox. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
