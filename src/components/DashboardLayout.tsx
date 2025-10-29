import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	BarChart3,
	Bell,
	Bot,
	Building2,
	ChevronDown,
	ChevronRight,
	FileText,
	Globe,
	MessageSquare,
	Plus,
	Search,
	Settings,
	Shield,
	TrendingUp,
	Upload,
	User,
	Menu,
	X,
	BotMessageSquareIcon,
	DatabaseIcon,
	CreditCard,
	FolderOpen,
	Users,
} from "lucide-react";
import React, { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "../contexts/OrganizationContext";
import { ThemeToggleCompact } from "./ThemeToggle";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
	const [showOrganizationsDropdown, setShowOrganizationsDropdown] =
		useState(false);
	const [agentSearch, setAgentSearch] = useState("");
	const [organizationSearch, setOrganizationSearch] = useState("");
	const [expandedKnowledgeBase, setExpandedKnowledgeBase] = useState(false);
	const [expandedSettings, setExpandedSettings] = useState(false);
	const [expandedGlobalSettings, setExpandedGlobalSettings] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	// Use organization context
	const {
		selectedOrganizationId,
		setSelectedOrganizationId,
		currentOrganization,
		organizations,
	} = useOrganization();

	// Fetch agents for the selector
	const agents = useQuery(api.agents.getAgentsForUser);

	// Platform/global navigation used in left sidebar when no agent selected
	const globalNavigation = [
		{ name: "Agents", href: "/dashboard/agents", icon: Bot },
		{ name: "Usage", href: "/dashboard/usage", icon: TrendingUp },
		{
			name: "Settings",
			href: "/dashboard/settings",
			icon: Settings,
			expandable: true,
			children: [
				{ name: "General", href: "/dashboard/settings", icon: Settings, exact: true },
				{ name: "Members", href: "/dashboard/settings/members", icon: Users },
				{ name: "Plans", href: "/dashboard/settings/plans", icon: FolderOpen },
				{ name: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
			],
		},
	];

	// Agent-specific navigation (left sidebar)
	const agentNavigation = [
		{ name: "Chat Playground", href: "/chat", icon: BotMessageSquareIcon },
		{
			name: "Sources",
			href: "/knowledge",
			icon: DatabaseIcon,
			expandable: true,
			children: [
				{ name: "Text", href: "/knowledge/text", icon: FileText },
				{ name: "Q&A", href: "/knowledge/qna", icon: MessageSquare },
				{ name: "Files", href: "/knowledge/upload", icon: Upload },
				{ name: "Website", href: "/knowledge/url", icon: Globe },
			],
		},
		{ name: "Conversations", href: "/conversations", icon: MessageSquare },
		{ name: "Deploy", href: "/deploy", icon: Globe },
		{ name: "Analytics", href: "/analytics", icon: BarChart3, disabled: true },
		{
			name: "Settings",
			href: "/settings",
			icon: Settings,
			expandable: true,
			children: [
				{ name: "General", href: "/settings", icon: User },
				{ name: "AI", href: "/settings/ai", icon: Bot },
				{
					name: "Chat Interface",
					href: "/settings/chat-interface",
					icon: MessageSquare,
				},
				{ name: "Security", href: "/settings/security", icon: Shield },
			],
		},
	];

	const isActive = (href: string) => {
		if (href === "/dashboard") {
			return location.pathname === "/dashboard";
		}
		return location.pathname.startsWith(href);
	};

	const isAgentNavActive = (navHref: string) => {
		const currentAgent = getCurrentAgent();
		if (!currentAgent) return false;

		const basePath = `/dashboard/agents/${currentAgent._id}`;
		return location.pathname.startsWith(basePath + navHref);
	};

	// Get current agent if we're on an agent page
	const getCurrentAgent = () => {
		const agentIdMatch = location.pathname.match(
			/\/dashboard\/agents\/([^\/]+)/,
		);
		if (agentIdMatch && agents) {
			const agentId = agentIdMatch[1];
			return agents.find((agent: any) => agent._id === agentId);
		}
		return null;
	};

	const currentAgent = getCurrentAgent();

	// Auto-expand Sources if we're on a knowledge page
	const isOnKnowledgePage =
		currentAgent &&
		location.pathname.includes(
			`/dashboard/agents/${currentAgent._id}/knowledge`,
		);

	// Auto-expand Settings if we're on a settings page
	const isOnSettingsPage =
		currentAgent &&
		location.pathname.includes(
			`/dashboard/agents/${currentAgent._id}/settings`,
		);

	// Use effect to auto-expand when on knowledge page
	React.useEffect(() => {
		if (isOnKnowledgePage) {
			setExpandedKnowledgeBase(true);
		}
	}, [isOnKnowledgePage]);

	// Use effect to auto-expand when on settings page
	React.useEffect(() => {
		if (isOnSettingsPage) {
			setExpandedSettings(true);
		}
	}, [isOnSettingsPage]);

	// Check if we're on an agent page to show the sidebar
	const showAgentSidebar =
		location.pathname.includes("/dashboard/agents/") && currentAgent;

	// Auto-expand global settings when on settings pages and not on agent
	React.useEffect(() => {
		if (!showAgentSidebar && location.pathname.startsWith("/dashboard/settings")) {
			setExpandedGlobalSettings(true);
		}
	}, [showAgentSidebar, location.pathname]);

	// Update organization selection logic for agent context
	const getOrganizationForAgent = () => {
		const currentAgent = getCurrentAgent();
		if (currentAgent && organizations) {
			const agentOrg = organizations.find(
				(org: any) => org._id === currentAgent.organizationId,
			);
			if (agentOrg && agentOrg._id !== selectedOrganizationId) {
				// Auto-switch to agent's organization if we're viewing an agent from a different org
				setSelectedOrganizationId(agentOrg._id);
				return agentOrg;
			}
		}
		return currentOrganization;
	};

	const displayOrganization = getOrganizationForAgent();

	// Filter organizations based on search
	const filteredOrganizations =
		organizations?.filter((org: any) =>
			org.name.toLowerCase().includes(organizationSearch.toLowerCase()),
		) || [];

	// Filter agents based on search and current organization
	const filteredAgents =
		agents?.filter((agent: any) => {
			const matchesSearch = agent.name
				.toLowerCase()
				.includes(agentSearch.toLowerCase());
			const matchesOrg = displayOrganization
				? agent.organizationId === displayOrganization._id
				: true;
			return matchesSearch && matchesOrg;
		}) || [];

	return (
		<div className="min-h-screen bg-background flex">
			{/* Left Sidebar - Agent Navigation */}
			{showAgentSidebar && (
				<div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border/50 flex flex-col transition-all duration-300`}>
					{/* Sidebar Header */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/30">
						<div className="flex items-center min-w-0">
							<div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center mr-3 flex-shrink-0">
								<Bot className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
							</div>
							{!sidebarCollapsed && (
								<div className="min-w-0">
									<h2 className="text-sm font-medium text-sidebar-foreground truncate">
										{currentAgent.name}
									</h2>
									<p className="text-xs text-muted-foreground/80 truncate">
										Agent
									</p>
								</div>
							)}
						</div>
						<button
							onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
							className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
						>
							{sidebarCollapsed ? (
								<Menu className="w-4 h-4 text-sidebar-foreground" />
							) : (
								<X className="w-4 h-4 text-sidebar-foreground" />
							)}
						</button>
					</div>

					{/* Sidebar Navigation */}
					<nav className="flex-1 px-3 py-3">
						<div className="space-y-0.5">
							{agentNavigation.map((item) => {
								const Icon = item.icon;
								const href = currentAgent
									? `/dashboard/agents/${currentAgent._id}${item.href}`
									: "#";

								if (item.disabled) {
									return (
										<div
											key={item.name}
											className={`flex items-center px-3 py-1.5 text-sm font-normal text-muted-foreground/60 cursor-not-allowed ${sidebarCollapsed ? 'justify-center' : ''}`}
											title={sidebarCollapsed ? item.name : undefined}
										>
											<Icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
											{!sidebarCollapsed && (
												<>
													{item.name}
													<span className="ml-auto text-xs bg-muted/50 text-muted-foreground/60 px-1.5 py-0.5 rounded text-[10px]">
														Soon
													</span>
												</>
											)}
										</div>
									);
								}

								// Handle expandable items (like Knowledge Base and Settings)
								if (item.expandable && item.children) {
									const isParentActive =
										isAgentNavActive(item.href) ||
										(item.children &&
											item.children.some((child) =>
												isAgentNavActive(child.href),
											));
									const isExpanded =
										item.name === "Sources"
											? expandedKnowledgeBase
											: item.name === "Settings"
												? expandedSettings
												: false;

									return (
										<div key={item.name}>
											{/* Parent Item */}
											<div
												className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors cursor-pointer ${isParentActive
													? "bg-sidebar-accent/80 text-sidebar-primary"
													: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
													} ${sidebarCollapsed ? 'justify-center' : ''}`}
												title={sidebarCollapsed ? item.name : undefined}
												onClick={() => {
													if (!sidebarCollapsed) {
														if (item.name === "Sources") {
															setExpandedKnowledgeBase(!expandedKnowledgeBase);
														} else if (item.name === "Settings") {
															setExpandedSettings(!expandedSettings);
														}
													}
													// Always navigate to the parent page
													if (currentAgent) {
														navigate({
															to: `/dashboard/agents/${currentAgent._id}${item.href}`,
														});
													}
												}}
											>
												<Icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
												{!sidebarCollapsed && (
													<>
														{item.name}
														{isExpanded ? (
															<ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
														) : (
															<ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
														)}
													</>
												)}
											</div>

											{/* Child Items - only show when not collapsed */}
											{isExpanded && !sidebarCollapsed && (
												<div className="ml-6 mt-0.5 space-y-0.5">
													{item.children.map((child) => {
														const ChildIcon = child.icon;
														const childHref = currentAgent
															? `/dashboard/agents/${currentAgent._id}${child.href}`
															: "#";

														return (
															<Link
																key={child.name}
																to={childHref}
																className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${isAgentNavActive(child.href)
																	? "bg-sidebar-accent text-sidebar-primary"
																	: "text-muted-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
																	}`}
															>
																<ChildIcon className="mr-3 h-3.5 w-3.5" />
																{child.name}
															</Link>
														);
													})}
												</div>
											)}
										</div>
									);
								}

								// Regular navigation items
								return (
									<Link
										key={item.name}
										to={href}
										className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${isAgentNavActive(item.href)
											? "bg-sidebar-accent/80 text-sidebar-primary"
											: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
											} ${sidebarCollapsed ? 'justify-center' : ''}`}
										title={sidebarCollapsed ? item.name : undefined}
									>
										<Icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
										{!sidebarCollapsed && item.name}
									</Link>
								);
							})}
						</div>
					</nav>

					{/* Sidebar Footer */}
					<div className="border-t border-sidebar-border p-3">
						<Link
							to="/dashboard/agents"
							className={`flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
							title={sidebarCollapsed ? "Back to All Agents" : undefined}
						>
							<Bot className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
							{!sidebarCollapsed && "← Back to All Agents"}
						</Link>
					</div>
				</div>
			)}

			{/* Left Sidebar - Global Navigation (when no agent selected) */}
			{!showAgentSidebar && (
				<div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border/50 flex flex-col transition-all duration-300`}>
					{/* Sidebar Header */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/30">
						<div className="flex items-center min-w-0">
							<div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center mr-3 flex-shrink-0">
								<Bot className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
							</div>
							{!sidebarCollapsed && (
								<div className="min-w-0">
									<h2 className="text-sm font-medium text-sidebar-foreground truncate">
										Navigation
									</h2>
									<p className="text-xs text-muted-foreground/80 truncate">Dashboard</p>
								</div>
							)}
						</div>
						<button
							onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
							className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
						>
							{sidebarCollapsed ? (
								<Menu className="w-4 h-4 text-sidebar-foreground" />
							) : (
								<X className="w-4 h-4 text-sidebar-foreground" />
							)}
						</button>
					</div>

					{/* Sidebar Navigation */}
					<nav className="flex-1 px-3 py-3">
						<div className="space-y-0.5">
							{globalNavigation.map((item) => {
								const Icon = item.icon as any;
								if ((item as any).expandable && (item as any).children) {
									const isParentActive =
										isActive(item.href) ||
										((item as any).children as any[]).some((child: any) =>
											isActive(child.href),
										);
									const isExpanded = expandedGlobalSettings;

									return (
										<div key={item.name}>
											{/* Parent */}
											<div
												className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors cursor-pointer ${isParentActive
													? "bg-sidebar-accent/80 text-sidebar-primary"
													: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
													} ${sidebarCollapsed ? 'justify-center' : ''}`}
												title={sidebarCollapsed ? item.name : undefined}
												onClick={() => {
													if (!sidebarCollapsed) {
														setExpandedGlobalSettings(!expandedGlobalSettings);
													}
													navigate({ to: item.href });
												}}
											>
												<Icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
												{!sidebarCollapsed && (
													<>
														{item.name}
														{isExpanded ? (
															<ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
														) : (
															<ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
														)}
													</>
												)}
											</div>

											{/* Children */}
											{isExpanded && !sidebarCollapsed && (
												<div className="ml-6 mt-0.5 space-y-0.5">
													{((item as any).children as any[]).map((child: any) => {
														const ChildIcon = child.icon;
														return (
															<Link
																key={child.name}
																to={child.href}
																className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${isActive(child.href)
																	? "bg-sidebar-accent text-sidebar-primary"
																	: "text-muted-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
																	}`}
															>
																<ChildIcon className="mr-3 h-3.5 w-3.5" />
																{child.name}
															</Link>
														);
													})}
												</div>
											)}
										</div>
									);
								}

								return (
									<Link
										key={item.name}
										to={item.href}
										className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${isActive(item.href)
											? "bg-sidebar-accent/80 text-sidebar-primary"
											: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
											} ${sidebarCollapsed ? 'justify-center' : ''}`}
										title={sidebarCollapsed ? item.name : undefined}
									>
										<Icon className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
										{!sidebarCollapsed && item.name}
									</Link>
								);
							})}
						</div>
					</nav>
				</div>
			)}

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Top Header */}
				<header className="bg-background/80 border-b border-border/30 sticky top-0 z-50 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
					<div className="mx-auto max-w-full px-4 lg:px-6">
						<div className="flex h-12 items-center justify-between">
							{/* Logo and Selectors */}
							<div className="flex items-center space-x-4">
								<Link
									to="/dashboard/agents"
									className="flex items-center space-x-2.5 text-base font-medium text-foreground hover:text-foreground/80 transition-colors"
								>
									<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
										<Bot className="w-3.5 h-3.5 text-primary-foreground" />
									</div>
									<span>Chatbox</span>
								</Link>

								{/* Organization Selector */}
								<div className="relative">
									<button
										onClick={() =>
											setShowOrganizationsDropdown(!showOrganizationsDropdown)
										}
										className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors min-w-[180px] justify-between border border-border"
									>
										<div className="flex items-center">
											<Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
											<span className="truncate">
												{displayOrganization
													? displayOrganization.name
													: "Select Organization"}
											</span>
										</div>
										<ChevronDown className="w-4 h-4 text-muted-foreground" />
									</button>

									{/* Organization Selector Dropdown */}
									{showOrganizationsDropdown && (
										<div className="absolute top-full left-0 mt-1 w-80 bg-popover rounded-lg shadow-lg ring-1 ring-border border border-border z-50 backdrop-blur-xl">
											<div className="p-3">
												{/* Search Input */}
												<div className="relative mb-3">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
													<input
														type="text"
														placeholder="Search organizations..."
														value={organizationSearch}
														onChange={(e) =>
															setOrganizationSearch(e.target.value)
														}
														className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
													/>
												</div>

												{/* Organizations Section */}
												<div className="mb-2">
													<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
														Organizations
													</h4>
													<div className="max-h-48 overflow-y-auto">
														{organizations === undefined ? (
															<div className="space-y-2">
																{[...Array(3)].map((_, i) => (
																	<div
																		key={i}
																		className="flex items-center px-3 py-2 rounded-lg animate-pulse"
																	>
																		<div className="w-4 h-4 bg-muted rounded mr-3"></div>
																		<div className="h-4 bg-muted rounded flex-1"></div>
																	</div>
																))}
															</div>
														) : filteredOrganizations.length === 0 ? (
															<div className="px-3 py-4 text-sm text-muted-foreground text-center">
																{organizationSearch
																	? "No organizations found"
																	: "No organizations yet"}
															</div>
														) : (
															<div className="space-y-1">
																{filteredOrganizations.map((org: any) => (
																	<button
																		key={org._id}
																		onClick={() => {
																			// Use context to change organization
																			setSelectedOrganizationId(org._id);
																			setShowOrganizationsDropdown(false);
																			setOrganizationSearch("");
																		}}
																		className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors ${displayOrganization?._id === org._id
																			? "bg-accent text-accent-foreground"
																			: "hover:bg-accent/50 text-foreground"
																			}`}
																	>
																		<Building2 className="w-4 h-4 mr-3 text-muted-foreground" />
																		<div className="flex-1 min-w-0">
																			<div className="font-medium truncate">
																				{org.name}
																			</div>
																			<div className="text-xs text-muted-foreground capitalize">
																				{org.memberRole} • {org.plan}
																			</div>
																		</div>
																		{displayOrganization?._id === org._id && (
																			<div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
																		)}
																	</button>
																))}
															</div>
														)}
													</div>
												</div>

												{/* Create Organization Button */}
												<div className="border-t border-border pt-2">
													<button
														onClick={() => {
															navigate({ to: "/dashboard/settings" }); // Navigate to settings instead since org creation route doesn't exist yet
															setShowOrganizationsDropdown(false);
															setOrganizationSearch("");
														}}
														className="w-full flex items-center px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
													>
														<Plus className="w-4 h-4 mr-3" />
														<span className="font-medium">
															Create organization
														</span>
													</button>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Agent Selector */}
								<div className="relative">
									<button
										onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
										className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors min-w-[200px] justify-between border border-border"
									>
										<div className="flex items-center">
											<Bot className="w-4 h-4 mr-2 text-muted-foreground" />
											<span className="truncate">
												{currentAgent ? currentAgent.name : "Select Agent"}
											</span>
										</div>
										<ChevronDown className="w-4 h-4 text-muted-foreground" />
									</button>

									{/* Agent Selector Dropdown */}
									{showAgentsDropdown && (
										<div className="absolute top-full left-0 mt-1 w-80 bg-popover rounded-lg shadow-lg ring-1 ring-border border border-border z-50 backdrop-blur-xl">
											<div className="p-3">
												{/* Search Input */}
												<div className="relative mb-3">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
													<input
														type="text"
														placeholder="Search agents..."
														value={agentSearch}
														onChange={(e) => setAgentSearch(e.target.value)}
														className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
													/>
												</div>

												{/* Current Organization Filter */}
												{displayOrganization && (
													<div className="mb-3 px-3 py-2 bg-accent/20 rounded-lg">
														<div className="text-xs text-primary font-medium">
															Showing agents from: {displayOrganization.name}
														</div>
													</div>
												)}

												{/* Agents Section */}
												<div className="mb-2">
													<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
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
																		<div className="w-4 h-4 bg-muted rounded mr-3"></div>
																		<div className="h-4 bg-muted rounded flex-1"></div>
																	</div>
																))}
															</div>
														) : filteredAgents.length === 0 ? (
															<div className="px-3 py-4 text-sm text-muted-foreground text-center">
																{agentSearch
																	? "No agents found"
																	: displayOrganization
																		? `No agents in ${displayOrganization.name}`
																		: "No agents yet"}
															</div>
														) : (
															<div className="space-y-1">
																{filteredAgents.map((agent: any) => (
																	<button
																		key={agent._id}
																		onClick={() => {
																			navigate({
																				to: `/dashboard/agents/${agent._id}`,
																			});
																			setShowAgentsDropdown(false);
																			setAgentSearch("");
																		}}
																		className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors ${currentAgent?._id === agent._id
																			? "bg-accent text-accent-foreground"
																			: "hover:bg-accent/50 text-foreground"
																			}`}
																	>
																		<Bot className="w-4 h-4 mr-3 text-muted-foreground" />
																		<div className="flex-1 min-w-0">
																			<div className="font-medium truncate">
																				{agent.name}
																			</div>
																			{agent.description && (
																				<div className="text-xs text-muted-foreground truncate">
																					{agent.description}
																				</div>
																			)}
																		</div>
																		{currentAgent?._id === agent._id && (
																			<div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
																		)}
																	</button>
																))}
															</div>
														)}
													</div>
												</div>

												{/* Create Agent Button */}
												<div className="border-t border-border pt-2">
													<button
														onClick={() => {
															navigate({ to: "/dashboard/agents/new" });
															setShowAgentsDropdown(false);
															setAgentSearch("");
														}}
														className="w-full flex items-center px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
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

							{/* Platform Navigation removed: now shown in left sidebar when no agent selected */}

							{/* Right side actions */}
							<div className="flex items-center space-x-3">
								{/* Search */}
								<button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
									<Search className="h-4 w-4" />
								</button>

								{/* Notifications */}
								<button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
									<Bell className="h-4 w-4" />
									<span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
								</button>

								{/* Theme Toggle */}
								<ThemeToggleCompact />

								{/* Create Agent Button */}
								<button
									onClick={() => navigate({ to: "/dashboard/agents/new" })}
									className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
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

						{/* Mobile platform nav removed: consolidated into left sidebar */}
					</div>
				</header>

				{/* Main content */}
				<main className="flex-1">
					<div
						className={`mx-auto px-4 lg:px-6 ${showAgentSidebar ? "max-w-full" : "max-w-[1600px]"}`}
					>
						{children}
					</div>
				</main>
			</div>

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
