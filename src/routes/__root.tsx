import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

import { OrganizationProvider } from "../contexts/OrganizationContext";
import ClerkProvider from "../integrations/clerk/provider.tsx";
import ConvexProvider from "../integrations/convex/provider.tsx";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const location = useLocation();

	// Don't show the header for dashboard routes since they have their own DashboardLayout
	const showHeader = !location.pathname.startsWith("/dashboard");

	// Only use OrganizationProvider for dashboard routes that need organization data
	const needsOrganization = location.pathname.startsWith("/dashboard");

	return (
		<>
			<ClerkProvider>
				<ConvexProvider>
					{needsOrganization ? (
						<OrganizationProvider>
							{showHeader && <Header />}
							<Outlet />
							<TanStackRouterDevtools />
						</OrganizationProvider>
					) : (
						<>
							{showHeader && <Header />}
							<Outlet />
							<TanStackRouterDevtools />
						</>
					)}
				</ConvexProvider>
			</ClerkProvider>
		</>
	);
}
