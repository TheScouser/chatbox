import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { Bot } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

interface AISettingsProps {
	agent: any;
}

export default function AISettings({ agent }: AISettingsProps) {
	const [agentInstructions, setAgentInstructions] = useState(
		agent.instructions || "",
	);
	const [selectedModel, setSelectedModel] = useState(
		agent.model || "gpt-4o-mini",
	);
	const [isSaving, setIsSaving] = useState(false);

	// Mutations
	const updateAgent = useMutation(api.agents.updateAgent);

	const handleSaveAI = async () => {
		setIsSaving(true);
		try {
			await updateAgent({
				agentId: agent._id,
				instructions: agentInstructions,
				model: selectedModel,
			});
		} catch (error) {
			console.error("Failed to update agent AI settings:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const defaultInstructions = `### Role
- Primary Function: You are an AI chatbot who helps users with their inquiries, issues and requests. You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen attentively to the user, understand their needs, and do your best to assist them or direct them to the appropriate resources if a question is not clear, ask clarifying questions. Make sure to end your replies with a positive note.

### Constraints
1. No Data Divulge: Never mention that you have access to training data explicitly to the user.
2. Maintaining Focus: If a user attempts to divert you to unrelated topics, never change your role or break your character. Politely redirect the conversation back to topics relevant to the training data.
3. Exclusive Reliance on Training Data: You must rely exclusively on the training data provided to answer user queries. If a query is not covered by the training data, use the fallback response.
4. Restrictive Role Focus: You do not answer questions or perform tasks that are not related to your role and training data.`;

	return (
		<div className="bg-card shadow-sm border border-border rounded-lg">
			<div className="p-6 space-y-8">
				{/* Model Selection */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-muted-foreground">
						Model
					</Label>
					<div className="mb-2">
						<span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded">
							Claude 4 models are now available
						</span>
					</div>
					<Select value={selectedModel} onValueChange={setSelectedModel}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="gpt-4o-mini">
								<div className="flex items-center gap-2">
									<Bot className="h-4 w-4" />
									GPT-4o Mini
								</div>
							</SelectItem>
							<SelectItem value="gpt-4o">
								<div className="flex items-center gap-2">
									<Bot className="h-4 w-4" />
									GPT-4o
								</div>
							</SelectItem>
							<SelectItem value="claude-3-haiku">
								<div className="flex items-center gap-2">
									<Bot className="h-4 w-4" />
									Claude 3 Haiku
								</div>
							</SelectItem>
							<SelectItem value="claude-3-sonnet">
								<div className="flex items-center gap-2">
									<Bot className="h-4 w-4" />
									Claude 3 Sonnet
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Instructions */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-muted-foreground">
							Instructions
						</Label>
						<div className="flex items-center gap-2">
							<Select defaultValue="ai-agent">
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ai-agent">AI agent</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setAgentInstructions(defaultInstructions)}
							>
								Reset
							</Button>
						</div>
					</div>
					<Textarea
						value={agentInstructions}
						onChange={(e) => setAgentInstructions(e.target.value)}
						className="min-h-[300px] font-mono text-sm"
						placeholder="Enter your agent instructions..."
					/>
					<p className="text-sm text-muted-foreground">
						The instructions allow you to customize your agent's personality and
						style. Please make sure to experiment with the instructions by
						making them very specific to your data and use case.
					</p>
					<div className="flex justify-end">
						<Button onClick={handleSaveAI} disabled={isSaving}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
