import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, Calendar, MessageSquare, Plus } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ContentCardEmpty } from "../components/ui/content-card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import { useOrganization } from "../contexts/OrganizationContext";

export const Route = createFileRoute("/dashboard/agents/")({
	component: AgentsList,
});

function AgentsList() {
	const navigate = useNavigate();
	const allAgents = useQuery(api.agents.getAgentsForUser);

	// Get organization context
	const { currentOrganization } = useOrganization();

	// Filter agents by current organization
	const agents = useMemo(() => {
		if (!currentOrganization || !allAgents) {
			return allAgents || [];
		}
		return allAgents.filter(
			(agent: any) => agent.organizationId === currentOrganization._id,
		);
	}, [currentOrganization, allAgents]);

	return (
		<PageLayout>
			<PageHeader
				title={
					currentOrganization
						? `${currentOrganization.name} Agents`
						: "My Agents"
				}
				description={
					currentOrganization ? (
						<>
							Create and manage AI agents for{" "}
							<span className="font-medium text-foreground">
								{currentOrganization.name}
							</span>
							. Each agent can be trained with specific knowledge and deployed
							anywhere.
						</>
					) : (
						"Create and manage your AI agents. Each agent can be trained with specific knowledge and deployed anywhere."
					)
				}
			>
				<Link to="/dashboard/agents/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create Agent
					</Button>
				</Link>
			</PageHeader>

			{/* Organization Context Indicator removed per UX request */}

			{/* Agents Grid */}
			{allAgents === undefined ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Loading skeletons */}
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardContent>
								<div className="flex items-center">
									<div className="w-10 h-10 bg-muted rounded-lg" />
									<div className="ml-4 flex-1">
										<div className="h-4 bg-muted rounded w-3/4" />
										<div className="h-3 bg-muted rounded w-1/2 mt-2" />
									</div>
								</div>
								<div className="mt-4 space-y-2">
									<div className="h-3 bg-muted rounded" />
									<div className="h-3 bg-muted rounded w-5/6" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : agents.length === 0 ? (
				/* Empty State */
				<ContentCardEmpty
					icon={Bot}
					title={
						currentOrganization
							? `No agents in ${currentOrganization.name} yet`
							: "No agents yet"
					}
					description={
						currentOrganization ? (
							<>
								Get started by creating your first AI agent for{" "}
								{currentOrganization.name}.
							</>
						) : (
							"Get started by creating your first AI agent."
						)
					}
				>
					<Link to="/dashboard/agents/new">
						<Button size="lg">
							<Plus className="mr-2 h-4 w-4" />
							Create your first agent
						</Button>
					</Link>
				</ContentCardEmpty>
			) : (
				/* Agents Grid */
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{agents.map((agent: any, index: number) => (
						<Card
							key={agent._id}
							onClick={() =>
								navigate({
									to: "/dashboard/agents/$agentId",
									params: { agentId: agent._id },
								})
							}
							className={cn(
								"group relative overflow-hidden animate-fade-in-up",
								index < 6 ? `stagger-${(index % 5) + 1}` : ""
							)}
						>
							<CardContent className="p-0">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
											<Bot className="h-6 w-6 text-primary" />
										</div>
										<div className="flex flex-col items-end">
											<span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">Status</span>
											<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
												<div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
												<span className="text-[10px] font-bold text-success uppercase tracking-wider">Active</span>
											</div>
										</div>
									</div>

									<div className="min-w-0 mb-4">
										<h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
											{agent.name}
										</h3>
										<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1 font-medium">
											{agent.description || "Building the future of AI interactions..."}
										</p>
									</div>

									<div className="flex items-center gap-4 py-3 border-t border-border/40">
										<div className="flex items-center text-xs font-semibold text-muted-foreground">
											<MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
											<span>243 chats</span>
										</div>
										<div className="flex items-center text-xs font-semibold text-muted-foreground">
											<Calendar className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
											<span>{new Date(agent._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
										</div>
									</div>
								</div>

								<div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</PageLayout>
	);
}
