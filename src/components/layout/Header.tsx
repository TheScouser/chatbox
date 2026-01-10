import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Bot, Building2, ChevronDown, Plus, Search } from "lucide-react";
import { ThemeToggleCompact } from "../ThemeToggle";

interface Organization {
	_id: string;
	name: string;
	memberRole?: string;
	plan?: string;
}

interface Agent {
	_id: string;
	name: string;
	description?: string;
	organizationId: string;
}

interface HeaderProps {
	currentOrganization: Organization | null;
	currentAgent: Agent | null;
	organizations: Organization[];
	agents: Agent[];
	showOrganizationsDropdown: boolean;
	showAgentsDropdown: boolean;
	onToggleOrganizationsDropdown: () => void;
	onToggleAgentsDropdown: () => void;
	onSelectOrganization: (org: Organization) => void;
	onSelectAgent: (agent: Agent) => void;
	organizationSearch: string;
	agentSearch: string;
	onOrganizationSearchChange: (value: string) => void;
	onAgentSearchChange: (value: string) => void;
	isOrganizationsLoading?: boolean;
	isAgentsLoading?: boolean;
	onToggleSidebar: () => void;
}

export function Header({
	currentOrganization,
	currentAgent,
	organizations,
	agents,
	showOrganizationsDropdown,
	showAgentsDropdown,
	onToggleOrganizationsDropdown,
	onToggleAgentsDropdown,
	onSelectOrganization,
	onSelectAgent,
	organizationSearch,
	agentSearch,
	onOrganizationSearchChange,
	onAgentSearchChange,
	isOrganizationsLoading,
	isAgentsLoading,
	onToggleSidebar,
}: HeaderProps) {
	const navigate = useNavigate();

	const filteredOrganizations = organizations.filter((org) =>
		org.name.toLowerCase().includes(organizationSearch.toLowerCase()),
	);

	const filteredAgents = agents.filter((agent) => {
		const matchesSearch = agent.name
			.toLowerCase()
			.includes(agentSearch.toLowerCase());
		const matchesOrg = currentOrganization
			? agent.organizationId === currentOrganization._id
			: true;
		return matchesSearch && matchesOrg;
	});

	return (
		<header className="w-full bg-background/60 backdrop-blur-xl border-b border-border/40 transition-all duration-200 supports-[backdrop-filter]:bg-background/60 py-3">
			<div className="h-full mx-auto max-w-full px-4 lg:px-6">
				<div className="flex h-full items-center justify-between gap-4">
					{/* Logo and Selectors */}
					<div className="flex items-center gap-4 lg:gap-6">
						<button
							onClick={onToggleSidebar}
							className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
							type="button"
						>
							<ChevronDown className="h-5 w-5 rotate-90" />
						</button>

						<div className="hidden sm:flex items-center space-x-2.5">
							<div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center">
								<Bot className="w-4 h-4 text-primary-foreground" />
							</div>
							<span className="text-sm font-bold tracking-tight">Chatbox</span>
						</div>

						<div className="h-6 w-px bg-border/50 hidden md:block" />

						<div className="flex items-center gap-3">
							{/* Organization Selector */}
							<OrgSelector
								currentOrganization={currentOrganization}
								organizations={filteredOrganizations}
								isOpen={showOrganizationsDropdown}
								onToggle={onToggleOrganizationsDropdown}
								onSelect={onSelectOrganization}
								searchValue={organizationSearch}
								onSearchChange={onOrganizationSearchChange}
								isLoading={isOrganizationsLoading}
							/>

							{/* Agent Selector */}
							<AgentSelector
								currentAgent={currentAgent}
								currentOrganization={currentOrganization}
								agents={filteredAgents}
								isOpen={showAgentsDropdown}
								onToggle={onToggleAgentsDropdown}
								onSelect={onSelectAgent}
								searchValue={agentSearch}
								onSearchChange={onAgentSearchChange}
								isLoading={isAgentsLoading}
							/>
						</div>
					</div>

					{/* Right side actions */}
					<div className="flex items-center gap-2 sm:gap-4">
						<div className="hidden sm:flex items-center bg-muted/40 rounded-full px-3 py-1.5 border border-border/50 hover:bg-muted/60 transition-colors w-64">
							<Search className="h-3.5 w-3.5 text-muted-foreground mr-2" />
							<input
								type="text"
								placeholder="Search..."
								className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground"
							/>
							<div className="flex text-[10px] font-mono text-muted-foreground/70 border border-border/50 rounded px-1">
								⌘K
							</div>
						</div>

						<div className="flex items-center gap-1 sm:gap-2">
							<button
								className="p-2 text-muted-foreground hover:text-foreground transition-colors relative hover:bg-muted/50 rounded-full"
								type="button"
							>
								<Bell className="h-4 w-4" />
								<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background" />
							</button>

							<ThemeToggleCompact />
						</div>

						<button
							onClick={() => navigate({ to: "/dashboard/agents/new" })}
							className="hidden sm:flex items-center px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
							type="button"
						>
							<Plus className="mr-1.5 h-3.5 w-3.5" />
							New Agent
						</button>

						<div className="relative pl-2 border-l border-border/50">
							<UserButton
								appearance={{
									elements: {
										avatarBox:
											"w-8 h-8 ring-2 ring-border/50 hover:ring-primary/20 transition-all",
									},
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

// Organization Selector Dropdown
interface OrgSelectorProps {
	currentOrganization: Organization | null;
	organizations: Organization[];
	isOpen: boolean;
	onToggle: () => void;
	onSelect: (org: Organization) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	isLoading?: boolean;
}

function OrgSelector({
	currentOrganization,
	organizations,
	isOpen,
	onToggle,
	onSelect,
	searchValue,
	onSearchChange,
	isLoading,
}: OrgSelectorProps) {
	const navigate = useNavigate();

	return (
		<div className="relative">
			<button
				onClick={onToggle}
				className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors min-w-[180px] justify-between border border-border"
				type="button"
			>
				<div className="flex items-center">
					<Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
					<span className="truncate">
						{currentOrganization?.name || "Select Organization"}
					</span>
				</div>
				<ChevronDown className="w-4 h-4 text-muted-foreground" />
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-1 w-80 bg-popover rounded-lg shadow-lg ring-1 ring-border border border-border z-50 backdrop-blur-xl">
					<div className="p-3">
						<div className="relative mb-3">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search organizations..."
								value={searchValue}
								onChange={(e) => onSearchChange(e.target.value)}
								className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
							/>
						</div>

						<div className="mb-2">
							<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
								Organizations
							</h4>
							<div className="max-h-48 overflow-y-auto">
								{isLoading ? (
									<LoadingSkeleton />
								) : organizations.length === 0 ? (
									<div className="px-3 py-4 text-sm text-muted-foreground text-center">
										{searchValue
											? "No organizations found"
											: "No organizations yet"}
									</div>
								) : (
									<div className="space-y-1">
										{organizations.map((org) => (
											<button
												key={org._id}
												onClick={() => onSelect(org)}
												className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors ${
													currentOrganization?._id === org._id
														? "bg-accent text-accent-foreground"
														: "hover:bg-accent/50 text-foreground"
												}`}
												type="button"
											>
												<Building2 className="w-4 h-4 mr-3 text-muted-foreground" />
												<div className="flex-1 min-w-0">
													<div className="font-medium truncate">{org.name}</div>
													<div className="text-xs text-muted-foreground capitalize">
														{org.memberRole} • {org.plan}
													</div>
												</div>
												{currentOrganization?._id === org._id && (
													<div className="w-2 h-2 bg-primary rounded-full ml-2" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="border-t border-border pt-2">
							<button
								onClick={() => navigate({ to: "/dashboard/settings" })}
								className="w-full flex items-center px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
								type="button"
							>
								<Plus className="w-4 h-4 mr-3" />
								<span className="font-medium">Create organization</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Agent Selector Dropdown
interface AgentSelectorProps {
	currentAgent: Agent | null;
	currentOrganization: Organization | null;
	agents: Agent[];
	isOpen: boolean;
	onToggle: () => void;
	onSelect: (agent: Agent) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	isLoading?: boolean;
}

function AgentSelector({
	currentAgent,
	currentOrganization,
	agents,
	isOpen,
	onToggle,
	onSelect,
	searchValue,
	onSearchChange,
	isLoading,
}: AgentSelectorProps) {
	const navigate = useNavigate();

	return (
		<div className="relative">
			<button
				onClick={onToggle}
				className="flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors min-w-[200px] justify-between border border-border"
				type="button"
			>
				<div className="flex items-center">
					<Bot className="w-4 h-4 mr-2 text-muted-foreground" />
					<span className="truncate">
						{currentAgent?.name || "Select Agent"}
					</span>
				</div>
				<ChevronDown className="w-4 h-4 text-muted-foreground" />
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 mt-1 w-80 bg-popover rounded-lg shadow-lg ring-1 ring-border border border-border z-50 backdrop-blur-xl">
					<div className="p-3">
						<div className="relative mb-3">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search agents..."
								value={searchValue}
								onChange={(e) => onSearchChange(e.target.value)}
								className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
							/>
						</div>

						{currentOrganization && (
							<div className="mb-3 px-3 py-2 bg-accent/20 rounded-lg">
								<div className="text-xs text-primary font-medium">
									Showing agents from: {currentOrganization.name}
								</div>
							</div>
						)}

						<div className="mb-2">
							<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
								Agents
							</h4>
							<div className="max-h-48 overflow-y-auto">
								{isLoading ? (
									<LoadingSkeleton />
								) : agents.length === 0 ? (
									<div className="px-3 py-4 text-sm text-muted-foreground text-center">
										{searchValue
											? "No agents found"
											: currentOrganization
												? `No agents in ${currentOrganization.name}`
												: "No agents yet"}
									</div>
								) : (
									<div className="space-y-1">
										{agents.map((agent) => (
											<button
												key={agent._id}
												onClick={() => onSelect(agent)}
												className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-lg transition-colors ${
													currentAgent?._id === agent._id
														? "bg-accent text-accent-foreground"
														: "hover:bg-accent/50 text-foreground"
												}`}
												type="button"
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
													<div className="w-2 h-2 bg-primary rounded-full ml-2" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="border-t border-border pt-2">
							<button
								onClick={() => navigate({ to: "/dashboard/agents/new" })}
								className="w-full flex items-center px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
								type="button"
							>
								<Plus className="w-4 h-4 mr-3" />
								<span className="font-medium">Create agent</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-2">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="flex items-center px-3 py-2 rounded-lg animate-pulse"
				>
					<div className="w-4 h-4 bg-muted rounded mr-3" />
					<div className="h-4 bg-muted rounded flex-1" />
				</div>
			))}
		</div>
	);
}
