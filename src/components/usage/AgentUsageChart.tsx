import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface AgentUsage {
	agentId: string;
	agentName: string;
	creditsUsed: number;
	lastUsed: string;
}

interface AgentUsageChartProps {
	agents: AgentUsage[];
	totalCredits: number;
	loading?: boolean;
}

// Colors for the pie chart segments
const COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#f97316",
	"#06b6d4",
	"#84cc16",
];

export function AgentUsageChart({
	agents,
	totalCredits,
	loading = false,
}: AgentUsageChartProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Credits used per agent</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 bg-gray-100 rounded animate-pulse" />
				</CardContent>
			</Card>
		);
	}

	// Prepare data for the pie chart
	const chartData = agents.map((agent, index) => ({
		...agent,
		percentage: totalCredits > 0 ? (agent.creditsUsed / totalCredits) * 100 : 0,
		color: COLORS[index % COLORS.length],
	}));

	// Format last used date
	const formatLastUsed = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Custom tooltip
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
					<p className="font-medium text-gray-900">{data.agentName}</p>
					<p className="text-blue-600">
						<span className="font-medium">{data.creditsUsed}</span> credits (
						{data.percentage.toFixed(1)}%)
					</p>
					<p className="text-gray-500 text-sm">
						Last used: {formatLastUsed(data.lastUsed)}
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom legend component
	const CustomLegend = ({ payload }: any) => {
		return (
			<div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
				{payload.map((entry: any, index: number) => (
					<div
						key={index}
						className="flex items-center justify-between text-sm"
					>
						<div className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="font-medium truncate max-w-32">
								{entry.payload.agentName}
							</span>
						</div>
						<div className="text-gray-600">
							<span className="font-medium">{entry.payload.creditsUsed}</span>
							<span className="text-xs ml-1">
								({entry.payload.percentage.toFixed(1)}%)
							</span>
						</div>
					</div>
				))}
			</div>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Credits used per agent</CardTitle>
			</CardHeader>
			<CardContent>
				{agents.length === 0 ? (
					<div className="flex items-center justify-center h-64 text-gray-500">
						<div className="text-center">
							<p className="font-medium">No agent usage data</p>
							<p className="text-sm">
								Agent usage will appear here once they start being used
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="h-48 w-full">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										cx="50%"
										cy="50%"
										innerRadius={40}
										outerRadius={80}
										paddingAngle={2}
										dataKey="creditsUsed"
									>
										{chartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip content={<CustomTooltip />} />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{/* Legend */}
						<div className="border-t pt-4">
							<h4 className="font-medium text-sm mb-3 text-gray-700">
								Agent Breakdown
							</h4>
							<CustomLegend payload={chartData} />
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
