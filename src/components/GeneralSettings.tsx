import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

interface GeneralSettingsProps {
	agent: any;
}

export default function GeneralSettings({ agent }: GeneralSettingsProps) {
	const [agentName, setAgentName] = useState(agent.name || "");
	const [copiedAgentId, setCopiedAgentId] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Mutations
	const updateAgent = useMutation(api.agents.updateAgent);
	const deleteAgent = useMutation(api.agents.deleteAgent);
	const deleteAllConversations = useMutation(
		api.conversations.deleteAllConversationsForAgent,
	);

	const copyAgentId = async () => {
		try {
			await navigator.clipboard.writeText(agent._id);
			setCopiedAgentId(true);
			setTimeout(() => setCopiedAgentId(false), 2000);
		} catch (err) {
			console.error("Failed to copy agent ID: ", err);
		}
	};

	const handleSaveGeneral = async () => {
		setIsSaving(true);
		try {
			await updateAgent({
				agentId: agent._id,
				name: agentName.trim(),
			});
		} catch (error) {
			console.error("Failed to update agent:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAllConversations = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete all conversations? This action cannot be undone.",
		);
		if (!confirmed) return;

		try {
			await deleteAllConversations({ agentId: agent._id });
		} catch (error) {
			console.error("Failed to delete conversations:", error);
		}
	};

	const handleDeleteAgent = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this agent? This action cannot be undone and will delete all associated data.",
		);
		if (!confirmed) return;

		const doubleConfirmed = window.confirm(
			"This will permanently delete your agent and all its data. Type 'DELETE' to confirm.",
		);
		if (!doubleConfirmed) return;

		try {
			await deleteAgent({ agentId: agent._id });
			// Navigate back to agents list
			window.location.href = "/dashboard/agents";
		} catch (error) {
			console.error("Failed to delete agent:", error);
		}
	};

	return (
		<div className="bg-white shadow rounded-lg">
			<div className="p-6 space-y-8">
				{/* Agent ID */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-700">Agent ID</Label>
					<div className="flex items-center gap-2">
						<div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm text-gray-900">
							{agent._id}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={copyAgentId}
							className="flex-shrink-0"
						>
							{copiedAgentId ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				{/* Size */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-700">Size</Label>
					<div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
						4 KB
					</div>
				</div>

				{/* Name */}
				<div className="space-y-2">
					<Label
						htmlFor="agent-name"
						className="text-sm font-medium text-gray-700"
					>
						Name
					</Label>
					<div className="flex items-center gap-4">
						<Input
							id="agent-name"
							value={agentName}
							onChange={(e) => setAgentName(e.target.value)}
							className="flex-1"
							placeholder="Enter agent name..."
						/>
						<Button
							onClick={handleSaveGeneral}
							disabled={isSaving || agentName.trim() === agent.name}
						>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>

				{/* Danger Zone */}
				<div className="pt-8 border-t border-gray-200">
					<div className="text-center mb-6">
						<span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
							DANGER ZONE
						</span>
					</div>

					{/* Delete all conversations */}
					<div className="bg-white border border-red-200 rounded-lg p-6 mb-6">
						<h4 className="text-lg font-medium text-red-900 mb-2">
							Delete all conversations
						</h4>
						<p className="text-sm text-red-700 mb-4">
							Once you delete all your conversations, there is no going back.
							Please be certain. All the conversations on this agent will be
							deleted. <strong>This action is not reversible</strong>
						</p>
						<Button
							variant="destructive"
							onClick={handleDeleteAllConversations}
							className="flex items-center gap-2"
						>
							<Trash2 className="h-4 w-4" />
							Delete All Conversations
						</Button>
					</div>

					{/* Delete agent */}
					<div className="bg-white border border-red-200 rounded-lg p-6">
						<h4 className="text-lg font-medium text-red-900 mb-2">
							Delete agent
						</h4>
						<p className="text-sm text-red-700 mb-4">
							Once you delete your agent, there is no going back. Please be
							certain. All your uploaded data will be deleted.{" "}
							<strong>This action is not reversible</strong>
						</p>
						<Button
							variant="destructive"
							onClick={handleDeleteAgent}
							className="flex items-center gap-2"
						>
							<Trash2 className="h-4 w-4" />
							Delete Agent
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
