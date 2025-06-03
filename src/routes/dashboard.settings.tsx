import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { Settings, Users, FolderOpen, CreditCard } from "lucide-react"

export const Route = createFileRoute('/dashboard/settings')({
    component: SettingsLayout,
})

function SettingsLayout() {
    const location = useLocation()

    const settingsNavigation = [
        {
            name: "General",
            href: "/dashboard/settings",
            icon: Settings,
            exact: true
        },
        {
            name: "Members",
            href: "/dashboard/settings/members",
            icon: Users
        },
        {
            name: "Plans",
            href: "/dashboard/settings/plans",
            icon: FolderOpen,
            highlight: true // This will be purple/highlighted
        },
        {
            name: "Billing",
            href: "/dashboard/settings/billing",
            icon: CreditCard
        },
    ]

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === href
        }
        return location.pathname.startsWith(href)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="flex gap-8">
                {/* Vertical Navigation */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {settingsNavigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href, item.exact)

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active
                                            ? item.highlight
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-gray-100 text-gray-900"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${active && item.highlight ? "text-purple-600" : ""
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
} 