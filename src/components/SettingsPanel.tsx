import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	Bot,
	Check,
	Copy,
	Info,
	MessageSquare,
	Settings,
	Shield,
	User,
	X,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

interface SettingsPanelProps {
	agent: any;
}

type SettingsTab = "general" | "ai" | "chat-interface" | "security";

const settingsTabs = [
	{ id: "general", name: "General", icon: User },
	{ id: "ai", name: "AI", icon: Bot },
	{ id: "chat-interface", name: "Chat Interface", icon: MessageSquare },
	{ id: "security", name: "Security", icon: Shield },
] as const;

export default function SettingsPanel({ agent }: SettingsPanelProps) {
	const [activeSettingsTab, setActiveSettingsTab] =
		useState<SettingsTab>("general");
	const [agentName, setAgentName] = useState(agent.name || "");
	const [agentInstructions, setAgentInstructions] = useState(
		agent.instructions || "",
	);
	const [selectedModel, setSelectedModel] = useState(
		agent.model || "gpt-4o-mini",
	);
	const [copiedAgentId, setCopiedAgentId] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Chat interface
	const [embedWidth, setEmbedWidth] = useState("400");
	const [embedHeight, setEmbedHeight] = useState("600");
	const [primaryColor, setPrimaryColor] = useState("#2563eb");

	// Security settings
	const [allowedDomains, setAllowedDomains] = useState<string[]>(
		agent.allowedDomains || [],
	);
	const [newDomain, setNewDomain] = useState("");
	const [widgetSecretKey, setWidgetSecretKey] = useState(
		agent.widgetSecretKey || "",
	);
	const [copiedSecretKey, setCopiedSecretKey] = useState(false);
	const [domainVerificationEnabled, setDomainVerificationEnabled] = useState(
		agent.domainVerificationEnabled || false,
	);

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

	const copySecretKey = async () => {
		try {
			await navigator.clipboard.writeText(widgetSecretKey);
			setCopiedSecretKey(true);
			setTimeout(() => setCopiedSecretKey(false), 2000);
		} catch (err) {
			console.error("Failed to copy secret key: ", err);
		}
	};

	const generateSecretKey = () => {
		const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		setWidgetSecretKey(key);
	};

	const addDomain = () => {
		if (newDomain.trim() && !allowedDomains.includes(newDomain.trim())) {
			setAllowedDomains([...allowedDomains, newDomain.trim()]);
			setNewDomain("");
		}
	};

	const removeDomain = (domain: string) => {
		setAllowedDomains(allowedDomains.filter((d) => d !== domain));
	};

	const handleSaveSecurity = async () => {
		setIsSaving(true);
		try {
			await updateAgent({
				agentId: agent._id,
				allowedDomains,
				widgetSecretKey,
				domainVerificationEnabled,
			});
		} catch (error) {
			console.error("Failed to update security settings:", error);
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
		<div className="flex h-full">
			{/* Left Sidebar */}
			<div className="w-64 bg-card border-r border-border flex-shrink-0">
				<div className="p-6">
					<h2 className="text-xl font-semibold text-foreground">Settings</h2>
				</div>
				<nav className="px-3 pb-6">
					{settingsTabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveSettingsTab(tab.id)}
								className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${activeSettingsTab === tab.id
									? "bg-primary/10 text-primary border-r-2 border-primary"
									: "text-muted-foreground hover:text-foreground hover:bg-muted"
									}`}
							>
								<Icon className="mr-3 h-4 w-4" />
								{tab.name}
							</button>
						);
					})}
				</nav>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<div className="p-8">
					{activeSettingsTab === "general" && (
						<div className="space-y-8">
							<div>
								<h3 className="text-2xl font-semibold text-foreground">
									General
								</h3>
							</div>

							{/* Agent ID */}
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Agent ID
								</Label>
								<div className="flex items-center gap-2">
									<div className="flex-1 px-3 py-2 bg-muted/30 border border-border rounded-md font-mono text-sm text-foreground">
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
								<Label className="text-sm font-medium text-muted-foreground">
									Size
								</Label>
								<div className="px-3 py-2 bg-muted/30 border border-border rounded-md text-sm text-foreground">
									4 KB
								</div>
							</div>

							{/* Name */}
							<div className="space-y-2">
								<Label
									htmlFor="agent-name"
									className="text-sm font-medium text-muted-foreground"
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
								<div className="bg-card border border-destructive/20 rounded-lg p-6 mb-6">
									<h4 className="text-lg font-medium text-destructive mb-2">
										Delete all conversations
									</h4>
									<p className="text-sm text-red-700 mb-4">
										Once you delete all your conversations, there is no going
										back. Please be certain. All the conversations on this agent
										will be deleted.{" "}
										<strong>This action is not reversible</strong>
									</p>
									<Button
										variant="destructive"
										onClick={handleDeleteAllConversations}
									>
										Delete
									</Button>
								</div>

								{/* Delete agent */}
								<div className="bg-card border border-destructive/20 rounded-lg p-6">
									<h4 className="text-lg font-medium text-destructive mb-2">
										Delete agent
									</h4>
									<p className="text-sm text-red-700 mb-4">
										Once you delete your agent, there is no going back. Please
										be certain. All your uploaded data will be deleted.{" "}
										<strong>This action is not reversible</strong>
									</p>
									<Button variant="destructive" onClick={handleDeleteAgent}>
										Delete
									</Button>
								</div>
							</div>
						</div>
					)}

					{activeSettingsTab === "ai" && (
						<div className="space-y-8">
							<div>
								<h3 className="text-2xl font-semibold text-foreground">AI</h3>
							</div>

							{/* Model Selection */}
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Model
								</Label>
								<div className="mb-2">
									<span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
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
								<p className="text-sm text-gray-600">
									The instructions allow you to customize your agent's
									personality and style. Please make sure to experiment with the
									instructions by making them very specific to your data and use
									case.
								</p>
								<div className="flex justify-end">
									<Button onClick={handleSaveAI} disabled={isSaving}>
										{isSaving ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Placeholder sections for other tabs */}
					{activeSettingsTab === "chat-interface" && (
						<div className="space-y-6">
							<h3 className="text-2xl font-semibold text-foreground">
								chat Interface
							</h3>
							<div className="bg-muted/30 rounded-lg p-6">
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
											<Select
												value={embedHeight}
												onValueChange={setEmbedHeight}
											>
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
												width:
													embedWidth === "100%" ? "100%" : `${embedWidth}px`,
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
					)}

					{activeSettingsTab === "security" && (
						<div className="space-y-8">
							<div>
								<h3 className="text-2xl font-semibold text-foreground">
									Security
								</h3>
								<p className="text-sm text-muted-foreground">
									Configure security settings for your chat widget and API
									access.
								</p>
							</div>

							{/* Domain Verification */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="text-lg font-medium text-foreground">
											Domain Verification
										</h4>
										<p className="text-sm text-muted-foreground">
											Restrict widget usage to specific domains to prevent
											unauthorized embedding.
										</p>
									</div>
									<div className="flex items-center">
										<input
											type="checkbox"
											id="domain-verification"
											checked={domainVerificationEnabled}
											onChange={(e) =>
												setDomainVerificationEnabled(e.target.checked)
											}
											className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
										/>
										<label
											htmlFor="domain-verification"
											className="ml-2 text-sm text-foreground"
										>
											Enable domain verification
										</label>
									</div>
								</div>

								{domainVerificationEnabled && (
									<div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
										<div className="flex items-start">
											<Info className="h-5 w-5 text-primary mt-0.5 mr-3" />
											<div>
												<h5 className="text-sm font-medium text-primary">
													How Domain Verification Works
												</h5>
												<p className="text-sm text-primary/80 mt-1">
													When enabled, your chat widget will only work on the
													domains you specify below. This prevents others from
													embedding your widget on unauthorized websites.
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Allowed Domains List */}
								<div className="space-y-3">
									<Label className="text-sm font-medium text-muted-foreground">
										Allowed Domains
									</Label>

									{/* Add Domain Input */}
									<div className="flex gap-2">
										<Input
											value={newDomain}
											onChange={(e) => setNewDomain(e.target.value)}
											placeholder="example.com"
											className="flex-1"
											onKeyPress={(e) => e.key === "Enter" && addDomain()}
										/>
										<Button onClick={addDomain} disabled={!newDomain.trim()}>
											Add Domain
										</Button>
									</div>

									{/* Domain List */}
									{allowedDomains.length > 0 && (
										<div className="space-y-2">
											{allowedDomains.map((domain, index) => (
												<div
													key={index}
													className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
												>
													<span className="text-sm font-mono text-foreground">
														{domain}
													</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => removeDomain(domain)}
														className="text-red-600 hover:text-red-800"
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									)}

									{allowedDomains.length === 0 && domainVerificationEnabled && (
										<div className="text-center py-4 bg-warning/10 border border-warning/20 rounded-lg">
											<p className="text-sm text-warning">
												⚠️ No domains added. Your widget will not work until you
												add at least one domain.
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Widget Secret Key */}
							<div className="space-y-4">
								<div>
									<h4 className="text-lg font-medium text-foreground">
										Widget Security Key
									</h4>
									<p className="text-sm text-muted-foreground">
										Secret key for HMAC verification. Keep this secure and never
										expose it in client-side code.
									</p>
								</div>

								<div className="space-y-3">
									<Label className="text-sm font-medium text-muted-foreground">
										Secret Key
									</Label>
									<div className="flex items-center gap-2">
										<div className="flex-1 px-3 py-2 bg-muted/30 border border-border rounded-md font-mono text-sm text-foreground">
											{widgetSecretKey
												? `${"•".repeat(8)}${widgetSecretKey.slice(-4)}`
												: "No key generated"}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={copySecretKey}
											disabled={!widgetSecretKey}
											className="flex-shrink-0"
										>
											{copiedSecretKey ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={generateSecretKey}
											className="flex-shrink-0"
										>
											Generate New
										</Button>
									</div>
								</div>

								<div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
									<div className="flex items-start">
										<Info className="h-5 w-5 text-warning mt-0.5 mr-3" />
										<div>
											<h5 className="text-sm font-medium text-warning">
												Keep Your Secret Key Safe
											</h5>
											<p className="text-sm text-warning/90 mt-1">
												Never commit this key to your repository, client-side
												code, or anywhere a third party can find it. Use it only
												on your server to generate HMAC signatures for widget
												authentication.
											</p>
										</div>
									</div>
								</div>

								{/* HMAC Implementation Example */}
								{widgetSecretKey && (
									<div className="space-y-3">
										<Label className="text-sm font-medium text-muted-foreground">
											Server Implementation Example
										</Label>
										<div className="bg-muted/30 rounded-lg p-3 font-mono text-sm text-foreground whitespace-pre-wrap">
											{`const crypto = require('crypto');

const secret = '${widgetSecretKey.slice(0, 8)}...'; // Your verification secret key
const userId = current_user.id; // A string UUID to identify your user

const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');

// Pass this hash to your widget initialization
// The widget will send both userId and hash for verification`}
										</div>
									</div>
								)}
							</div>

							{/* Save Button */}
							<div className="flex justify-end pt-6 border-t border-border">
								<Button onClick={handleSaveSecurity} disabled={isSaving}>
									{isSaving ? "Saving..." : "Save Security Settings"}
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
