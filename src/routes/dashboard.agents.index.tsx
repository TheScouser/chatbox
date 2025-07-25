import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Bot, Building2, Calendar, MessageSquare, Plus } from "lucide-react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
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
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between border-b border-gray-200 pb-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						{currentOrganization
							? `${currentOrganization.name} Agents`
							: "My Agents"}
					</h1>
					<p className="mt-1 text-sm text-gray-600">
						{currentOrganization ? (
							<>
								Create and manage AI agents for{" "}
								<span className="font-medium">{currentOrganization.name}</span>.
								Each agent can be trained with specific knowledge and deployed
								anywhere.
							</>
						) : (
							"Create and manage your AI agents. Each agent can be trained with specific knowledge and deployed anywhere."
						)}
					</p>
				</div>
				<button
					onClick={() => navigate({ to: "/dashboard/agents/new" })}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<Plus className="mr-2 h-4 w-4" />
					Create Agent
				</button>
			</div>

			{/* Organization Context Indicator */}
			{currentOrganization && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<Building2 className="w-5 h-5 text-blue-600" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-900">
								Viewing agents for: {currentOrganization.name}
							</h3>
							<p className="text-sm text-blue-700">
								Your role:{" "}
								<span className="capitalize font-medium">
									{currentOrganization.memberRole}
								</span>{" "}
								• Plan:{" "}
								<span className="capitalize font-medium">
									{currentOrganization.plan}
								</span>
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Agents Grid */}
			{allAgents === undefined ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{/* Loading skeletons */}
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
						>
							<div className="p-6">
								<div className="flex items-center">
									<div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
									<div className="ml-4 flex-1">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
									</div>
								</div>
								<div className="mt-4 space-y-2">
									<div className="h-3 bg-gray-200 rounded"></div>
									<div className="h-3 bg-gray-200 rounded w-5/6"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : agents.length === 0 ? (
				/* Empty State */
				<div className="text-center py-12">
					<Bot className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						{currentOrganization
							? `No agents in ${currentOrganization.name} yet`
							: "No agents yet"}
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{currentOrganization ? (
							<>
								Get started by creating your first AI agent for{" "}
								{currentOrganization.name}.
							</>
						) : (
							"Get started by creating your first AI agent."
						)}
					</p>
					<div className="mt-6">
						<button
							onClick={() => navigate({ to: "/dashboard/agents/new" })}
							className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<Plus className="mr-2 h-4 w-4" />
							Create your first agent
						</button>
					</div>
				</div>
			) : (
				/* Agents Grid */
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{agents.map((agent: any) => (
						<div
							key={agent._id}
							onClick={() =>
								navigate({
									to: "/dashboard/agents/$agentId",
									params: { agentId: agent._id },
								})
							}
							className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
						>
							<div className="p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
											<Bot className="h-6 w-6 text-blue-600" />
										</div>
									</div>
									<div className="ml-4 flex-1 min-w-0">
										<h3 className="text-lg font-medium text-gray-900 truncate">
											{agent.name}
										</h3>
										<p className="text-sm text-gray-500">
											Created{" "}
											{new Date(agent._creationTime).toLocaleDateString()}
										</p>
									</div>
								</div>

								<div className="mt-4">
									<p className="text-sm text-gray-600 line-clamp-2">
										{agent.description || "No description provided"}
									</p>
								</div>

								<div className="mt-4 flex items-center justify-between text-sm text-gray-500">
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-1" />
										{new Date(agent._creationTime).toLocaleDateString()}
									</div>
									<div className="flex items-center">
										<MessageSquare className="h-4 w-4 mr-1" />
										<span>0 conversations</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
