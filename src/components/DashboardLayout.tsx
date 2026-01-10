import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	Bot,
	BotMessageSquareIcon,
	CreditCard,
	DatabaseIcon,
	FileText,
	FolderOpen,
	Globe,
	Layout,
	MessageSquare,
	Settings,
	Shield,
	TrendingUp,
	Upload,
	User,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrganization } from "../contexts/OrganizationContext";
import { type Agent, useAgent } from "../hooks/useAgent";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header, type NavItem, Sidebar } from "./layout";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();

	// Navigation configurations - using translations
	const globalNavigation: NavItem[] = useMemo(() => [
		{ name: t("navigation.agents"), href: "/dashboard/agents", icon: Bot },
		{ name: t("navigation.usage"), href: "/dashboard/usage", icon: TrendingUp },
		{
			name: t("navigation.settings"),
			href: "/dashboard/settings",
			icon: Settings,
			expandable: true,
			children: [
				{
					name: t("navigation.general"),
					href: "/dashboard/settings",
					icon: Settings,
					exact: true,
				},
				{ name: t("navigation.members"), href: "/dashboard/settings/members", icon: Users },
				{ name: t("navigation.plans"), href: "/dashboard/settings/plans", icon: FolderOpen },
				{
					name: t("navigation.billing"),
					href: "/dashboard/settings/billing",
					icon: CreditCard,
				},
			],
		},
	], [t]);

	const agentNavigation: NavItem[] = useMemo(() => [
		{ name: t("navigation.chatPlayground"), href: "/chat", icon: BotMessageSquareIcon },
		{
			name: t("navigation.sources"),
			href: "/knowledge",
			icon: DatabaseIcon,
			expandable: true,
			children: [
				{ name: t("navigation.text"), href: "/knowledge/text", icon: FileText },
				{ name: t("navigation.qna"), href: "/knowledge/qna", icon: MessageSquare },
				{ name: t("navigation.files"), href: "/knowledge/upload", icon: Upload },
				{ name: t("navigation.website"), href: "/knowledge/url", icon: Globe },
			],
		},
		{ name: t("navigation.conversations"), href: "/conversations", icon: MessageSquare },
		{ name: t("navigation.widget"), href: "/widget", icon: Layout },
		{ name: t("navigation.deploy"), href: "/deploy", icon: Globe },
		{ name: t("navigation.analytics"), href: "/analytics", icon: BarChart3, disabled: true },
		{
			name: t("navigation.settings"),
			href: "/settings",
			icon: Settings,
			expandable: true,
			children: [
				{ name: t("navigation.general"), href: "/settings", icon: User },
				{ name: t("navigation.ai"), href: "/settings/ai", icon: Bot },
				{
					name: t("navigation.chatInterface"),
					href: "/settings/chat-interface",
					icon: MessageSquare,
				},
				{ name: t("navigation.security"), href: "/settings/security", icon: Shield },
			],
		},
	], [t]);

	// UI State
	const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
	const [showOrganizationsDropdown, setShowOrganizationsDropdown] =
		useState(false);
	const [agentSearch, setAgentSearch] = useState("");
	const [organizationSearch, setOrganizationSearch] = useState("");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({});

	// Organization context
	const {
		selectedOrganizationId,
		setSelectedOrganizationId,
		currentOrganization,
		organizations,
	} = useOrganization();

	// Agent context
	const { agents, currentAgent, showAgentSidebar } = useAgent();

	// Auto-sync organization when viewing an agent from different org
	useEffect(() => {
		if (currentAgent && organizations) {
			const agentOrg = organizations.find(
				(org: any) => org._id === currentAgent.organizationId,
			);
			if (agentOrg && agentOrg._id !== selectedOrganizationId) {
				setSelectedOrganizationId(agentOrg._id);
			}
		}
	}, [
		currentAgent,
		organizations,
		selectedOrganizationId,
		setSelectedOrganizationId,
	]);

	// Auto-expand sections based on current route
	useEffect(() => {
		if (currentAgent) {
			const basePath = `/dashboard/agents/${currentAgent._id}`;
			if (location.pathname.includes(`${basePath}/knowledge`)) {
				setExpandedSections((prev) => ({ ...prev, Sources: true }));
			}
			if (location.pathname.includes(`${basePath}/settings`)) {
				setExpandedSections((prev) => ({ ...prev, Settings: true }));
			}
		} else if (location.pathname.startsWith("/dashboard/settings")) {
			setExpandedSections((prev) => ({ ...prev, Settings: true }));
		}
	}, [location.pathname, currentAgent]);

	// Navigation helpers
	const isGlobalNavActive = (href: string) => {
		if (href === "/dashboard") return location.pathname === "/dashboard";
		return location.pathname.startsWith(href);
	};

	const isAgentNavActive = (navHref: string) => {
		if (!currentAgent) return false;
		const basePath = `/dashboard/agents/${currentAgent._id}`;
		return location.pathname.startsWith(basePath + navHref);
	};

	const buildAgentHref = (href: string) => {
		return currentAgent ? `/dashboard/agents/${currentAgent._id}${href}` : "#";
	};

	// Handlers
	const handleSelectOrganization = (org: { _id: string; name: string }) => {
		setSelectedOrganizationId(org._id);
		setShowOrganizationsDropdown(false);
		setOrganizationSearch("");
	};

	const handleSelectAgent = (agent: { _id: string; name: string }) => {
		navigate({ to: `/dashboard/agents/${agent._id}` });
		setShowAgentsDropdown(false);
		setAgentSearch("");
	};

	const handleToggleSection = (sectionName: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionName]: !prev[sectionName],
		}));
	};

	// Filter agents by current organization
	const filteredAgents =
		agents?.filter((agent: Agent) => {
			const matchesOrg = currentOrganization
				? agent.organizationId === currentOrganization._id
				: true;
			return matchesOrg;
		}) || [];

	return (
		<div className="min-h-screen bg-background flex">
			{/* Agent Sidebar */}
			{showAgentSidebar && currentAgent && (
				<Sidebar
					title={currentAgent.name}
					subtitle={t("navigation.agent")}
					navigation={agentNavigation}
					collapsed={sidebarCollapsed}
					onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
					isNavActive={isAgentNavActive}
					buildHref={buildAgentHref}
					expandedSections={expandedSections}
					onToggleSection={handleToggleSection}
					footerContent={
						<Link
							to="/dashboard/agents"
							className={`flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
							title={sidebarCollapsed ? t("navigation.backToAllAgents") : undefined}
						>
							<Bot className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
							{!sidebarCollapsed && t("navigation.backToAllAgents")}
						</Link>
					}
				/>
			)}

			{/* Global Sidebar */}
			{!showAgentSidebar && (
				<Sidebar
					title={t("navigation.navigation")}
					subtitle={t("navigation.dashboard")}
					navigation={globalNavigation}
					collapsed={sidebarCollapsed}
					onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
					isNavActive={isGlobalNavActive}
					buildHref={(href) => href}
					expandedSections={expandedSections}
					onToggleSection={handleToggleSection}
				/>
			)}

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">
				<Header
					currentOrganization={currentOrganization}
					currentAgent={currentAgent}
					organizations={organizations || []}
					agents={filteredAgents}
					showOrganizationsDropdown={showOrganizationsDropdown}
					showAgentsDropdown={showAgentsDropdown}
					onToggleOrganizationsDropdown={() =>
						setShowOrganizationsDropdown(!showOrganizationsDropdown)
					}
					onToggleAgentsDropdown={() =>
						setShowAgentsDropdown(!showAgentsDropdown)
					}
					onSelectOrganization={handleSelectOrganization}
					onSelectAgent={handleSelectAgent}
					organizationSearch={organizationSearch}
					agentSearch={agentSearch}
					onOrganizationSearchChange={setOrganizationSearch}
					onAgentSearchChange={setAgentSearch}
					isOrganizationsLoading={organizations === undefined}
					isAgentsLoading={agents === undefined}
					onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>

				{/* Main content */}
				<main className="flex-1 overflow-x-hidden">
					<div
						key={location.pathname}
						className={`mx-auto p-6 lg:p-8 animate-fade-in ${showAgentSidebar ? "max-w-full" : "max-w-[1600px]"}`}
					>
						<ErrorBoundary>{children}</ErrorBoundary>
					</div>
				</main>
			</div>

			{/* Click outside handlers for dropdowns */}
			{showAgentsDropdown && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setShowAgentsDropdown(false)}
					onKeyDown={(e) => e.key === "Escape" && setShowAgentsDropdown(false)}
					role="button"
					tabIndex={-1}
					aria-label="Close agents dropdown"
				/>
			)}
			{showOrganizationsDropdown && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setShowOrganizationsDropdown(false)}
					onKeyDown={(e) =>
						e.key === "Escape" && setShowOrganizationsDropdown(false)
					}
					role="button"
					tabIndex={-1}
					aria-label="Close organizations dropdown"
				/>
			)}
		</div>
	);
}
