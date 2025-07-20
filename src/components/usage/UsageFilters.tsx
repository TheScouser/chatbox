import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDateRange, useOrganizationAgents } from "@/hooks/useUsageDashboard";
import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

interface UsageFiltersProps {
	selectedDateRange: "7d" | "30d" | "90d";
	selectedAgentId: string | null;
	onDateRangeChange: (range: "7d" | "30d" | "90d") => void;
	onAgentChange: (agentId: string | null) => void;
}

export function UsageFilters({
	selectedDateRange,
	selectedAgentId,
	onDateRangeChange,
	onAgentChange,
}: UsageFiltersProps) {
	const { agents, loading: agentsLoading } = useOrganizationAgents();
	const dateRange = useDateRange(selectedDateRange);

	const dateRangeOptions = [
		{ value: "7d", label: "Last 7 days" },
		{ value: "30d", label: "Last 30 days" },
		{ value: "90d", label: "Last 90 days" },
	];

	return (
		<Card className="mb-6">
			<CardContent className="p-4">
				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
					{/* Left side - Title */}
					<div>
						<h2 className="text-xl font-semibold text-gray-900">Usage</h2>
						<p className="text-sm text-gray-600 mt-1">
							Monitor your usage and track consumption patterns
						</p>
					</div>

					{/* Right side - Filters */}
					<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
						{/* Agent Filter */}
						<Select
							value={selectedAgentId || "all"}
							onValueChange={(value) =>
								onAgentChange(value === "all" ? null : value)
							}
						>
							<SelectTrigger className="w-full sm:w-48">
								<SelectValue placeholder="All agents" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All agents</SelectItem>
								{!agentsLoading &&
									agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{agent.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>

						{/* Date Range Filter */}
						<Select
							value={selectedDateRange}
							onValueChange={(value) =>
								onDateRangeChange(value as "7d" | "30d" | "90d")
							}
						>
							<SelectTrigger className="w-full sm:w-56">
								<Calendar className="h-4 w-4 mr-2" />
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{dateRangeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Date Range Display */}
				<div className="mt-4 pt-4 border-t border-gray-100">
					<div className="flex items-center justify-between text-sm text-gray-600">
						<span>Showing data for: {dateRange.label}</span>
						<span className="text-xs">
							{selectedAgentId
								? agents.find((a) => a.id === selectedAgentId)?.name ||
									"Selected agent"
								: "All agents"}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
