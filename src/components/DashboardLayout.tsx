import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	Bot,
	ChevronDown,
	Home,
	MessageSquare,
	Plus,
	Settings,
	Search,
	Bell,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [agentSearch, setAgentSearch] = useState("");

	// Fetch agents for the selector
	const agents = useQuery(api.agents.getAgentsForUser);

	const navigation = [
		{ name: "Overview", href: "/dashboard", icon: Home },
		{ name: "Agents", href: "/dashboard/agents", icon: Bot },
	];

	const isActive = (href: string) => {
		if (href === "/dashboard") {
			return location.pathname === "/dashboard";
		}
		return location.pathname.startsWith(href);
	};

	// Get current agent if we're on an agent page
	const getCurrentAgent = () => {
		const agentIdMatch = location.pathname.match(/\/dashboard\/agents\/([^\/]+)/);
		if (agentIdMatch && agents) {
			const agentId = agentIdMatch[1];
			return agents.find(agent => agent._id === agentId);
		}
		return null;
	};

	const currentAgent = getCurrentAgent();

	// Filter agents based on search
	const filteredAgents = agents?.filter(agent => 
		agent.name.toLowerCase().includes(agentSearch.toLowerCase())
	) || [];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Compact Header */}
			<header className="bg-white shadow-sm border-b sticky top-0 z-50">
				<div className="mx-auto max-w-[1600px] px-4 lg:px-6">
					<div className="flex h-14 items-center justify-between">
						{/* Logo and Agent Selector */}
						<div className="flex items-center space-x-4">
							<Link
								to="/dashboard"
								className="flex items-center space-x-2 text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors"
							>
								<div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
									<Bot className="w-4 h-4 text-white" />
								</div>
								<span>AI Agent Platform</span>
							</Link>

							{/* Agent Selector */}
							<div className="relative">
								<button
									onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
									className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-w-[200px] justify-between"
								>
									<div className="flex items-center">
										<Bot className="w-4 h-4 mr-2 text-gray-500" />
										<span className="truncate">
											{currentAgent ? currentAgent.name : "Select Agent"}
										</span>
									</div>
									<ChevronDown className="w-4 h-4 text-gray-400" />
								</button>

								{/* Agent Selector Dropdown */}
								{showAgentsDropdown && (
									<div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
										<div className="p-3">
											{/* Search Input */}
											<div className="relative mb-3">
												<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
												<input
													type="text"
													placeholder="Search agents..."
													value={agentSearch}
													onChange={(e) => setAgentSearch(e.target.value)}
													className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												/>
											</div>

											{/* Agents Section */}
											<div className="mb-2">
												<h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
													Agents
												</h4>
												<div className="max-h-48 overflow-y-auto">
													{agents === undefined ? (
														<div className="space-y-2">
															{[...Array(3)].map((_, i) => (
																<div
																	key={i}
																	className="flex items-center px-3 py-2 rounded-lg animate-pulse"
																>
																	<div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
																	<div className="h-4 bg-gray-200 rounded flex-1"></div>
																</div>
															))}
														</div>
													) : filteredAgents.length === 0 ? (
														<div className="px-3 py-4 text-sm text-gray-500 text-center">
															{agentSearch ? "No agents found" : "No agents yet"}
														</div>
													) : (
														<div className="space-y-1">
															{filteredAgents.map((agent) => (
																<button
																	key={agent._id}
																	onClick={() => {
																		navigate({ to: `/dashboard/agents/${agent._id}` });
																		setShowAgentsDropdown(false);
																		setAgentSearch("");
																	}}
																	className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors ${
																		currentAgent?._id === agent._id
																			? "bg-blue-50 text-blue-700"
																			: "hover:bg-gray-50 text-gray-700"
																	}`}
																>
																	<Bot className="w-4 h-4 mr-3 text-gray-400" />
																	<div className="flex-1 min-w-0">
																		<div className="font-medium truncate">
																			{agent.name}
																		</div>
																		{agent.description && (
																			<div className="text-xs text-gray-500 truncate">
																				{agent.description}
																			</div>
																		)}
																	</div>
																	{currentAgent?._id === agent._id && (
																		<div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
																	)}
																</button>
															))}
														</div>
													)}
												</div>
											</div>

											{/* Create Agent Button */}
											<div className="border-t border-gray-100 pt-2">
												<button
													onClick={() => {
														navigate({ to: "/dashboard/agents/new" });
														setShowAgentsDropdown(false);
														setAgentSearch("");
													}}
													className="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												>
													<Plus className="w-4 h-4 mr-3" />
													<span className="font-medium">Create agent</span>
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Main Navigation */}
						<nav className="hidden md:flex items-center space-x-1">
							{navigation.map((item) => {
								const Icon = item.icon;

								return (
									<Link
										key={item.name}
										to={item.href}
										className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
											isActive(item.href)
												? "bg-blue-50 text-blue-700"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									>
										<Icon className="mr-1.5 h-4 w-4" />
										{item.name}
									</Link>
								);
							})}
						</nav>

						{/* Right side actions */}
						<div className="flex items-center space-x-3">
							{/* Search */}
							<button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
								<Search className="h-4 w-4" />
							</button>

							{/* Notifications */}
							<button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
								<Bell className="h-4 w-4" />
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
							</button>

							{/* Create Agent Button */}
							<button
								onClick={() => navigate({ to: "/dashboard/agents/new" })}
								className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
							>
								<Plus className="mr-1.5 h-4 w-4" />
								New Agent
							</button>

							{/* User Menu */}
							<div className="relative">
								<UserButton
									appearance={{
										elements: {
											avatarBox: "w-7 h-7",
										},
									}}
								/>
							</div>
						</div>
					</div>

					{/* Mobile Navigation */}
					<div className="md:hidden border-t border-gray-200 bg-gray-50">
						<div className="px-2 py-2">
							<div className="flex items-center justify-between">
								<div className="flex space-x-1 overflow-x-auto">
									{navigation.map((item) => {
										const Icon = item.icon;

										return (
											<Link
												key={item.name}
												to={item.href}
												className={`flex items-center px-2 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
													isActive(item.href)
														? "bg-blue-100 text-blue-700"
														: "text-gray-600 hover:text-gray-900"
												}`}
											>
												<Icon className="mr-1 h-3 w-3" />
												{item.name}
											</Link>
										);
									})}
								</div>
								<button
									onClick={() => navigate({ to: "/dashboard/agents/new" })}
									className="flex items-center px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors whitespace-nowrap ml-2"
								>
									<Plus className="mr-1 h-3 w-3" />
									New
								</button>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="py-4">
				<div className="mx-auto max-w-[1600px] px-4 lg:px-6">{children}</div>
			</main>

			{/* Click outside handler for dropdowns */}
			{showAgentsDropdown && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setShowAgentsDropdown(false)}
				/>
			)}
		</div>
	);
}
