import { Link } from "@tanstack/react-router";
import {
	Bot,
	ChevronDown,
	ChevronRight,
	Menu,
	X,
} from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem {
	name: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	disabled?: boolean;
	expandable?: boolean;
	exact?: boolean;
	children?: NavItem[];
}

interface SidebarProps {
	title: string;
	subtitle: string;
	navigation: NavItem[];
	footerContent?: ReactNode;
	collapsed: boolean;
	onToggleCollapse: () => void;
	isNavActive: (href: string) => boolean;
	buildHref: (href: string) => string;
	expandedSections: Record<string, boolean>;
	onToggleSection: (sectionName: string) => void;
}

export function Sidebar({
	title,
	subtitle,
	navigation,
	footerContent,
	collapsed,
	onToggleCollapse,
	isNavActive,
	buildHref,
	expandedSections,
	onToggleSection,
}: SidebarProps) {
	return (
		<div
			className={`${collapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border/50 flex flex-col transition-all duration-300`}
		>
			{/* Sidebar Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/30">
				<div className="flex items-center min-w-0">
					<div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center mr-3 flex-shrink-0">
						<Bot className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
					</div>
					{!collapsed && (
						<div className="min-w-0">
							<h2 className="text-sm font-medium text-sidebar-foreground truncate">
								{title}
							</h2>
							<p className="text-xs text-muted-foreground/80 truncate">
								{subtitle}
							</p>
						</div>
					)}
				</div>
				<button
					onClick={onToggleCollapse}
					className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
					type="button"
				>
					{collapsed ? (
						<Menu className="w-4 h-4 text-sidebar-foreground" />
					) : (
						<X className="w-4 h-4 text-sidebar-foreground" />
					)}
				</button>
			</div>

			{/* Sidebar Navigation */}
			<nav className="flex-1 px-3 py-3">
				<div className="space-y-0.5">
					{navigation.map((item) => (
						<NavItemComponent
							key={item.name}
							item={item}
							collapsed={collapsed}
							isActive={isNavActive(item.href)}
							buildHref={buildHref}
							isNavActive={isNavActive}
							isExpanded={expandedSections[item.name] || false}
							onToggleExpand={() => onToggleSection(item.name)}
						/>
					))}
				</div>
			</nav>

			{/* Sidebar Footer */}
			{footerContent && (
				<div className="border-t border-sidebar-border p-3">{footerContent}</div>
			)}
		</div>
	);
}

interface NavItemComponentProps {
	item: NavItem;
	collapsed: boolean;
	isActive: boolean;
	buildHref: (href: string) => string;
	isNavActive: (href: string) => boolean;
	isExpanded: boolean;
	onToggleExpand: () => void;
}

function NavItemComponent({
	item,
	collapsed,
	isActive,
	buildHref,
	isNavActive,
	isExpanded,
	onToggleExpand,
}: NavItemComponentProps) {
	const Icon = item.icon;
	const href = buildHref(item.href);

	// Disabled items
	if (item.disabled) {
		return (
			<div
				className={`flex items-center px-3 py-1.5 text-sm font-normal text-muted-foreground/60 cursor-not-allowed ${collapsed ? "justify-center" : ""}`}
				title={collapsed ? item.name : undefined}
			>
				<Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
				{!collapsed && (
					<>
						{item.name}
						<span className="ml-auto text-xs bg-muted/50 text-muted-foreground/60 px-1.5 py-0.5 rounded text-[10px]">
							Soon
						</span>
					</>
				)}
			</div>
		);
	}

	// Expandable items with children
	if (item.expandable && item.children) {
		const isParentActive =
			isActive || item.children.some((child) => isNavActive(child.href));

		return (
			<div>
				{/* Parent Item */}
				<div
					className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors cursor-pointer ${
						isParentActive
							? "bg-sidebar-accent/80 text-sidebar-primary"
							: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
					} ${collapsed ? "justify-center" : ""}`}
					title={collapsed ? item.name : undefined}
					onClick={onToggleExpand}
					onKeyDown={(e) => e.key === "Enter" && onToggleExpand()}
					role="button"
					tabIndex={0}
				>
					<Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
					{!collapsed && (
						<>
							{item.name}
							{isExpanded ? (
								<ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
							) : (
								<ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
							)}
						</>
					)}
				</div>

				{/* Child Items */}
				{isExpanded && !collapsed && (
					<div className="ml-6 mt-0.5 space-y-0.5">
						{item.children.map((child) => {
							const ChildIcon = child.icon;
							const childHref = buildHref(child.href);
							const childActive = isNavActive(child.href);

							return (
								<Link
									key={child.name}
									to={childHref}
									className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${
										childActive
											? "bg-sidebar-accent text-sidebar-primary"
											: "text-muted-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
									}`}
								>
									<ChildIcon className="mr-3 h-3.5 w-3.5" />
									{child.name}
								</Link>
							);
						})}
					</div>
				)}
			</div>
		);
	}

	// Regular navigation items
	return (
		<Link
			to={href}
			className={`flex items-center px-3 py-1.5 text-sm font-normal rounded-md transition-colors ${
				isActive
					? "bg-sidebar-accent/80 text-sidebar-primary"
					: "text-sidebar-foreground/90 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
			} ${collapsed ? "justify-center" : ""}`}
			title={collapsed ? item.name : undefined}
		>
			<Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
			{!collapsed && item.name}
		</Link>
	);
}
