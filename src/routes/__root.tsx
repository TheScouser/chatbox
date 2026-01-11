import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

import { ErrorBoundary } from "../components/ErrorBoundary";
import Header from "../components/Header";
import { PageLoading } from "../components/ui/skeleton";

import { OrganizationProvider } from "../contexts/OrganizationContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import ClerkProvider from "../integrations/clerk/provider.tsx";
import ConvexProvider from "../integrations/convex/provider.tsx";

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: RootErrorComponent,
});

function RootErrorComponent({ error }: { error: Error }) {
	return (
		<ThemeProvider>
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<ErrorBoundary fullPage>
					{/* Force error to be caught by throwing it */}
					<ErrorThrower error={error} />
				</ErrorBoundary>
			</div>
		</ThemeProvider>
	);
}

function ErrorThrower({ error }: { error: Error }) {
	throw error;
}

function RootComponent() {
	const location = useLocation();

	// Don't show the header for dashboard routes since they have their own DashboardLayout
	const showHeader = !location.pathname.startsWith("/dashboard");

	// Only use OrganizationProvider for dashboard routes that need organization data
	const needsOrganization = location.pathname.startsWith("/dashboard");

	return (
		<ErrorBoundary fullPage>
			<ThemeProvider>
				<ClerkProvider>
					<ConvexProvider>
						<Suspense
							fallback={<PageLoading message="Loading application..." />}
						>
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
						</Suspense>
					</ConvexProvider>
				</ClerkProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
