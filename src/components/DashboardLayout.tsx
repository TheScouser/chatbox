import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	Bot,
	Home,
	MessageSquare,
	Plus,
	Settings,
} from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();

	const navigation = [
		{ name: "Overview", href: "/dashboard", icon: Home },
		{ name: "Agents", href: "/dashboard/agents", icon: Bot },
		{
			name: "Conversations",
			href: "/dashboard",
			icon: MessageSquare,
			disabled: true,
		},
		{
			name: "Knowledge Base",
			href: "/dashboard",
			icon: BookOpen,
			disabled: true,
		},
		{ name: "Settings", href: "/dashboard", icon: Settings, disabled: true },
	];

	const isActive = (href: string) => {
		if (href === "/dashboard") {
			return location.pathname === "/dashboard";
		}
		return location.pathname.startsWith(href);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
				<div className="flex h-full flex-col">
					{/* Logo */}
					<div className="flex h-16 items-center justify-between px-6 border-b">
						<h1 className="text-xl font-bold text-gray-900">
							AI Agent Platform
						</h1>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 px-4 py-6">
						{navigation.map((item) => {
							const Icon = item.icon;

							if (item.disabled) {
								return (
									<div
										key={item.name}
										className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
									>
										<Icon className="mr-3 h-5 w-5 text-gray-300" />
										{item.name}
										<span className="ml-auto text-xs text-gray-300">
											(Soon)
										</span>
									</div>
								);
							}

							return (
								<Link
									key={item.name}
									to={item.href}
									className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										isActive(item.href)
											? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<Icon
										className={`mr-3 h-5 w-5 ${
											isActive(item.href)
												? "text-blue-700"
												: "text-gray-400 group-hover:text-gray-500"
										}`}
									/>
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* Create Agent Button */}
					<div className="px-4 pb-4">
						<button
							className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
							onClick={() => navigate({ to: "/dashboard/agents/new" })}
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Agent
						</button>
					</div>

					{/* User Profile */}
					<div className="border-t px-4 py-4">
						<div className="flex items-center">
							<UserButton
								appearance={{
									elements: {
										avatarBox: "w-8 h-8",
									},
								}}
							/>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-700">Dashboard</p>
								<p className="text-xs text-gray-500">Manage your AI agents</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="pl-64">
				<main className="py-6">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
