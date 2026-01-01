import { useLocation } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface Agent {
	_id: Id<"agents">;
	name: string;
	description?: string;
	organizationId: Id<"organizations">;
}

export function useAgent() {
	const location = useLocation();
	const agents = useQuery(api.agents.getAgentsForUser);
	const isLoading = agents === undefined;

	// Get current agent from URL
	// Matches /dashboard/agents/:agentId/*
	const getAgentFromUrl = () => {
		// Basic regex to find agent ID in path
		const match = location.pathname.match(/\/dashboard\/agents\/([^/]+)/);
		if (match && agents) {
			const agentId = match[1];
			return agents.find((agent) => agent._id === agentId) || null;
		}
		return null;
	};

	const currentAgent = getAgentFromUrl();
	const isAgentSidebarVisible = !!(
		currentAgent &&
		location.pathname.includes("/dashboard/agents/") &&
		!location.pathname.endsWith("/dashboard/agents")
	);

	return {
		agents,
		currentAgent,
		isLoading,
		showAgentSidebar: isAgentSidebarVisible,
	};
}
