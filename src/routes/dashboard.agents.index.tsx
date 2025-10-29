import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, Building2, Calendar, MessageSquare, Plus } from "lucide-react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { useOrganization } from "../contexts/OrganizationContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { PageLayout } from "../components/ui/layout";
import { PageHeader } from "../components/ui/page-header";
import { ContentCard, ContentCardEmpty } from "../components/ui/content-card";
import { Alert, AlertDescription } from "../components/ui/alert";

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
				title={currentOrganization
					? `${currentOrganization.name} Agents`
					: "My Agents"}
				description={currentOrganization ? (
					<>
						Create and manage AI agents for{" "}
						<span className="font-medium text-foreground">{currentOrganization.name}</span>.
						Each agent can be trained with specific knowledge and deployed
						anywhere.
					</>
				) : (
					"Create and manage your AI agents. Each agent can be trained with specific knowledge and deployed anywhere."
				)}
				action={
					<Button
						onClick={() => navigate({ to: "/dashboard/agents/new" })}
					>
						<Plus className="mr-2 h-4 w-4" />
						Create Agent
					</Button>
				}
			/>

			{/* Organization Context Indicator removed per UX request */}

			{/* Agents Grid */}
			{allAgents === undefined ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Loading skeletons */}
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardContent>
								<div className="flex items-center">
									<div className="w-10 h-10 bg-muted rounded-lg"></div>
									<div className="ml-4 flex-1">
										<div className="h-4 bg-muted rounded w-3/4"></div>
										<div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
									</div>
								</div>
								<div className="mt-4 space-y-2">
									<div className="h-3 bg-muted rounded"></div>
									<div className="h-3 bg-muted rounded w-5/6"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : agents.length === 0 ? (
				/* Empty State */
				<ContentCardEmpty
					icon={Bot}
					title={currentOrganization
						? `No agents in ${currentOrganization.name} yet`
						: "No agents yet"}
					description={currentOrganization ? (
						<>
							Get started by creating your first AI agent for{" "}
							{currentOrganization.name}.
						</>
					) : (
						"Get started by creating your first AI agent."
					)}
					action={
						<Button
							onClick={() => navigate({ to: "/dashboard/agents/new" })}
							size="lg"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create your first agent
						</Button>
					}
				/>
			) : (
				/* Agents Grid */
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{agents.map((agent: any) => (
						<Card
							key={agent._id}
							onClick={() =>
								navigate({
									to: "/dashboard/agents/$agentId",
									params: { agentId: agent._id },
								})
							}
							className="cursor-pointer transition-all duration-200 hover:border-border group"
						>
							<CardContent>
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
											<Bot className="h-6 w-6 text-primary" />
										</div>
									</div>
									<div className="ml-4 flex-1 min-w-0">
										<h3 className="text-lg font-semibold text-foreground truncate">
											{agent.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											Created{" "}
											{new Date(agent._creationTime).toLocaleDateString()}
										</p>
									</div>
								</div>

								<div className="mt-4">
									<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
										{agent.description || "No description provided"}
									</p>
								</div>

								<div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-1.5" />
										{new Date(agent._creationTime).toLocaleDateString()}
									</div>
									<div className="flex items-center">
										<MessageSquare className="h-4 w-4 mr-1.5" />
										<span>0 conversations</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</PageLayout>
	);
}
