import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

interface OrganizationContextType {
	selectedOrganizationId: string | null;
	setSelectedOrganizationId: (orgId: string | null) => void;
	currentOrganization: Doc<"organizations"> | null;
	organizations: Doc<"organizations">[] | undefined;
	isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
	undefined,
);

export function OrganizationProvider({
	children,
}: { children: React.ReactNode }) {
	const [selectedOrganizationId, setSelectedOrganizationId] = useState<
		string | null
	>(null);
	const { isLoaded, isSignedIn } = useAuth();
	const organizations = useQuery(
		api.organizations.getUserOrganizations,
		isLoaded && isSignedIn ? {} : "skip",
	);

	// Get current organization
	const currentOrganization = React.useMemo(() => {
		if (!organizations) return null;

		if (selectedOrganizationId) {
			const selected = organizations.find(
				(org) => org._id === selectedOrganizationId,
			);
			if (selected) return selected;
		}

		// Default to first organization
		return organizations[0] || null;
	}, [selectedOrganizationId, organizations]);

	// Auto-select first organization when data loads
	useEffect(() => {
		if (organizations && organizations.length > 0 && !selectedOrganizationId) {
			setSelectedOrganizationId(organizations[0]?._id ?? null);
		}
	}, [organizations, selectedOrganizationId]);

	const value = {
		selectedOrganizationId,
		setSelectedOrganizationId,
		currentOrganization,
		organizations,
		isLoading: organizations === undefined,
	};

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}

export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error(
			"useOrganization must be used within an OrganizationProvider",
		);
	}
	return context;
}
