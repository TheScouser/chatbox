import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Bot, Settings } from "lucide-react";
import { useState } from "react";
import type { Doc } from "../../convex/_generated/dataModel";

interface ChatInterfaceSettingsProps {
	agent: Doc<"agents">;
}

export default function ChatInterfaceSettings({ agent }: ChatInterfaceSettingsProps) {
	// Chat interface state
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");
	const [primaryColor, setPrimaryColor] = useState("#2563eb");

	return (
		<div className="bg-card shadow-sm border border-border rounded-lg">
			<div className="p-6">
				{/* Customization Options */}
				<div className="bg-card shadow-sm border border-border rounded-lg p-6">
					<div className="flex items-start gap-3 mb-6">
						<Settings className="h-5 w-5 text-primary mt-0.5" />
						<div>
							<h4 className="text-sm font-medium text-foreground">
								Customize Widget
							</h4>
							<p className="text-sm text-muted-foreground mt-1">
								Adjust the appearance and size of your chat widget
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Width */}
						<div className="space-y-2">
							<Label htmlFor="width" className="text-sm font-medium">
								Width
							</Label>
							<Select value={embedWidth} onValueChange={setEmbedWidth}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="300">300px</SelectItem>
									<SelectItem value="400">400px</SelectItem>
									<SelectItem value="500">500px</SelectItem>
									<SelectItem value="100%">100%</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Height */}
						<div className="space-y-2">
							<Label htmlFor="height" className="text-sm font-medium">
								Height
							</Label>
							<Select value={embedHeight} onValueChange={setEmbedHeight}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="400">400px</SelectItem>
									<SelectItem value="500">500px</SelectItem>
									<SelectItem value="600">600px</SelectItem>
									<SelectItem value="700">700px</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Primary Color */}
						<div className="space-y-2">
							<Label htmlFor="color" className="text-sm font-medium">
								Primary Color
							</Label>
							<div className="flex gap-2">
								<Input
									type="color"
									value={primaryColor}
									onChange={(e) => setPrimaryColor(e.target.value)}
									className="w-12 h-10 p-1 border rounded"
								/>
								<Input
									type="text"
									value={primaryColor}
									onChange={(e) => setPrimaryColor(e.target.value)}
									placeholder="#2563eb"
									className="flex-1"
								/>
							</div>
						</div>
					</div>

					{/* Preview */}
					<div className="mt-6 p-4 bg-muted/30 rounded-lg">
						<h5 className="text-sm font-medium text-foreground mb-2">
							Preview
						</h5>
						<div className="text-xs text-muted-foreground mb-3">
							Widget size: {embedWidth} × {embedHeight}
						</div>
						<div
							className="border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm"
							style={{
								width: embedWidth === "100%" ? "100%" : `${embedWidth}px`,
								height: "120px",
								maxWidth: "100%",
							}}
						>
							<div className="text-center">
								<Bot
									className="h-6 w-6 mx-auto mb-1"
									style={{ color: primaryColor }}
								/>
								<div>Chat Widget Preview</div>
								<div className="text-xs">
									{embedWidth} × {embedHeight}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
