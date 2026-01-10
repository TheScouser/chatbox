import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bot, ChevronDown } from "lucide-react";
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
	isNavActive,
	buildHref,
	expandedSections,
	onToggleSection,
}: SidebarProps) {
	return (
		<div
			className={cn(
				"bg-sidebar/80 backdrop-blur-md border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative z-30",
				collapsed ? "w-20" : "w-72",
			)}
		>
			{/* Sidebar Header */}
			<div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border/30">
				<div
					className={cn(
						"flex items-center min-w-0 transition-opacity duration-200",
						collapsed ? "opacity-0 invisible absolute" : "opacity-100 visible",
					)}
				>
					<div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl shadow-lg shadow-sidebar-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
						<Bot className="w-4 h-4 text-sidebar-primary-foreground" />
					</div>
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-sidebar-foreground tracking-tight truncate">
							{title}
						</h2>
						<p className="text-xs text-muted-foreground truncate font-medium">
							{subtitle}
						</p>
					</div>
				</div>

				{/* Collapsed Logo View */}
				<div
					className={cn(
						"absolute left-0 right-0 flex justify-center transition-opacity duration-200",
						collapsed ? "opacity-100 visible" : "opacity-0 invisible",
					)}
				>
					<div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-xl shadow-lg shadow-sidebar-primary/20 flex items-center justify-center">
						<Bot className="w-4 h-4 text-sidebar-primary-foreground" />
					</div>
				</div>
			</div>

			{/* Sidebar Navigation */}
			<nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-none">
				<div className="space-y-1">
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
				<div className="px-4 py-4 border-t border-sidebar-border/50 bg-sidebar/50">
					{footerContent}
				</div>
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
				className={cn(
					"flex items-center px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed transition-all duration-200 rounded-lg",
					collapsed ? "justify-center" : "mx-1",
				)}
				title={collapsed ? item.name : undefined}
			>
				<Icon
					className={cn(
						"w-4 h-4 transition-colors",
						collapsed ? "w-5 h-5" : "mr-3",
					)}
				/>
				{!collapsed && (
					<>
						{item.name}
						<span className="ml-auto text-[10px] uppercase font-bold tracking-wider bg-muted/50 text-muted-foreground/50 px-1.5 py-0.5 rounded-md">
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
			<div className="mb-1">
				{/* Parent Item */}
				<button
					className={cn(
						"w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
						isParentActive
							? "text-sidebar-foreground"
							: "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
						collapsed ? "justify-center" : "mx-1",
					)}
					title={collapsed ? item.name : undefined}
					onClick={onToggleExpand}
				>
					<Icon
						className={cn(
							"w-4 h-4 transition-colors duration-200",
							collapsed ? "w-5 h-5" : "mr-3",
							isParentActive
								? "text-sidebar-primary"
								: "text-muted-foreground group-hover:text-sidebar-foreground",
						)}
					/>
					{!collapsed && (
						<>
							<span className="flex-1 text-left">{item.name}</span>
							<ChevronDown
								className={cn(
									"w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
									isExpanded ? "transform rotate-180" : "",
								)}
							/>
						</>
					)}
				</button>

				{/* Child Items */}
				{isExpanded && !collapsed && (
					<div className="mt-1 ml-4 space-y-0.5 border-l border-sidebar-border pl-2 my-1 animate-fade-in-down duration-200">
						{item.children.map((child) => {
							const ChildIcon = child.icon;
							const childHref = buildHref(child.href);
							const childActive = isNavActive(child.href);

							return (
								<Link
									key={child.name}
									to={childHref}
									className={cn(
										"flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 group relative overflow-hidden",
										childActive
											? "text-sidebar-primary font-medium bg-sidebar-primary/5"
											: "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30",
									)}
								>
									{childActive && (
										<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-sidebar-primary rounded-r-full" />
									)}
									<ChildIcon
										className={cn(
											"w-3.5 h-3.5 mr-3 transition-colors",
											childActive
												? "text-sidebar-primary"
												: "text-muted-foreground group-hover:text-sidebar-foreground",
										)}
									/>
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
			className={cn(
				"flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
				isActive
					? "bg-gradient-to-r from-sidebar-primary/10 to-transparent text-sidebar-primary"
					: "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
				collapsed ? "justify-center" : "mx-1",
			)}
			title={collapsed ? item.name : undefined}
		>
			{isActive && !collapsed && (
				<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-full shadow-lg shadow-sidebar-primary/20" />
			)}
			<Icon
				className={cn(
					"w-4 h-4 transition-colors duration-200",
					collapsed ? "w-5 h-5" : "mr-3",
					isActive
						? "text-sidebar-primary"
						: "text-muted-foreground group-hover:text-sidebar-foreground",
				)}
			/>
			{!collapsed && item.name}
		</Link>
	);
}
