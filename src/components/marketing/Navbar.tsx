import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Bot, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-border z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-foreground">ChatBox</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#features"
                            className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
                        >
                            How it Works
                        </a>
                        <a
                            href="#pricing"
                            className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
                        >
                            Pricing
                        </a>
                        <a
                            href="#testimonials"
                            className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
                        >
                            Testimonials
                        </a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Unauthenticated>
                            <SignInButton>
                                <button type="button" className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignInButton>
                                <button type="button" className="bg-blue-600 dark:bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-primary/90 transition-colors">
                                    Get Started Free
                                </button>
                            </SignInButton>
                        </Unauthenticated>
                        <Authenticated>
                            <Link
                                to="/dashboard/agents"
                                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground transition-colors"
                            >
                                Dashboard
                            </Link>
                            <UserButton />
                        </Authenticated>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-600 dark:text-muted-foreground" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-600 dark:text-muted-foreground" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-border">
                        <div className="flex flex-col space-y-4">
                            <a
                                href="#features"
                                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                            >
                                How it Works
                            </a>
                            <a
                                href="#pricing"
                                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                            >
                                Pricing
                            </a>
                            <a
                                href="#testimonials"
                                className="text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                            >
                                Testimonials
                            </a>
                            <div className="pt-4 border-t border-gray-200 dark:border-border">
                                <Unauthenticated>
                                    <SignInButton>
                                        <button type="button" className="block text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground mb-2 w-full text-left">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <SignInButton>
                                        <button type="button" className="block bg-blue-600 dark:bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-primary/90 text-center w-full">
                                            Get Started Free
                                        </button>
                                    </SignInButton>
                                </Unauthenticated>
                                <Authenticated>
                                    <Link
                                        to="/dashboard/agents"
                                        className="block text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground mb-2"
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
    );
}
