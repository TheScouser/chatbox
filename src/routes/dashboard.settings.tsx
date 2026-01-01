import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
	component: SettingsLayout,
});

function SettingsLayout() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
			</div>

			{/* Main Content only; navigation now lives in the global sidebar */}
			<div className="flex">
				<div className="flex-1 min-w-0">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
