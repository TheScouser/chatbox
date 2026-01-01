import { Link } from "@tanstack/react-router";

import ClerkHeader from "../integrations/clerk/header-user.tsx";

export default function Header() {
	return (
		<header className="p-2 flex gap-2 justify-between items-center bg-background border-b border-border text-foreground">
			<nav className="flex flex-row">
				<div className="px-2 font-bold">
					<Link to="/">Home</Link>
				</div>
			</nav>

			<div>
				<ClerkHeader />
			</div>
		</header>
	);
}
