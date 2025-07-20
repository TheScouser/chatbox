import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/billing")({
	component: BillingLayout,
});

function BillingLayout() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Billing & Usage</h1>
				<p className="text-gray-600">
					Manage your subscription and monitor usage
				</p>
			</div>
			<Outlet />
		</div>
	);
}
