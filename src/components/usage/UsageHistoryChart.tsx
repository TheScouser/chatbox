import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface UsageHistoryData {
	date: string;
	creditsUsed: number;
}

interface UsageHistoryChartProps {
	data: UsageHistoryData[];
	loading?: boolean;
}

export function UsageHistoryChart({
	data,
	loading = false,
}: UsageHistoryChartProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Usage history</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-64 bg-gray-100 rounded animate-pulse" />
				</CardContent>
			</Card>
		);
	}

	// Helper function to format dates
	const formatDate = (dateStr: string, type: "short" | "full") => {
		const date = new Date(dateStr);
		if (type === "short") {
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Transform data for display
	const chartData = data.map((item) => ({
		...item,
		formattedDate: formatDate(item.date, "short"),
		fullDate: formatDate(item.date, "full"),
	}));

	// Custom tooltip component
	interface TooltipProps {
		active?: boolean;
		payload?: Array<{
			payload: {
				fullDate: string;
				credits: number;
			};
		}>;
	}
	const CustomTooltip = ({ active, payload }: TooltipProps) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-popover border border-border rounded-lg shadow-lg p-3">
					<p className="font-medium text-foreground">{data.fullDate}</p>
					<p className="text-primary">
						<span className="font-medium">{data.creditsUsed}</span> credits used
					</p>
				</div>
			);
		}
		return null;
	};

	// Calculate max value for Y-axis
	const maxValue = Math.max(...data.map((d) => d.creditsUsed), 10);
	const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding

	return (
		<Card>
			<CardHeader>
				<CardTitle>Usage history</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-64 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{
								top: 20,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								className="opacity-30 stroke-border"
							/>
							<XAxis
								dataKey="formattedDate"
								tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
								tickLine={{ stroke: "var(--color-border)" }}
								axisLine={{ stroke: "var(--color-border)" }}
							/>
							<YAxis
								domain={[0, yAxisMax]}
								tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
								tickLine={{ stroke: "var(--color-border)" }}
								axisLine={{ stroke: "var(--color-border)" }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar
								dataKey="creditsUsed"
								fill="var(--color-primary)"
								radius={[4, 4, 0, 0]}
								maxBarSize={60}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{data.length === 0 && (
					<div className="flex items-center justify-center h-64 text-muted-foreground">
						<div className="text-center">
							<p className="font-medium">No usage data</p>
							<p className="text-sm">
								Usage will appear here once you start using your agents
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
