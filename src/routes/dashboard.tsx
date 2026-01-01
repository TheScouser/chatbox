import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "../components/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	return (
		<>
			<SignedIn>
				<DashboardLayout>
					<Outlet />
				</DashboardLayout>
			</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
}
