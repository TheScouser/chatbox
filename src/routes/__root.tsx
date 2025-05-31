import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

import ClerkProvider from "../integrations/clerk/provider.tsx";

import ConvexProvider from "../integrations/convex/provider.tsx";

export const Route = createRootRoute({
	component: () => (
		<>
			<ClerkProvider>
				<ConvexProvider>
					<Header />

					<Outlet />
					<TanStackRouterDevtools />
				</ConvexProvider>
			</ClerkProvider>
		</>
	),
});
