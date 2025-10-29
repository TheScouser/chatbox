import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
    beforeLoad: () => {
        // Redirect dashboard index to agents landing
        throw redirect({ to: "/dashboard/agents", replace: true });
    },
});

