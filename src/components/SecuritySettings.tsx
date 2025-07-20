import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Check, Copy, Info, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

interface SecuritySettingsProps {
	agent: any;
}

export default function SecuritySettings({ agent }: SecuritySettingsProps) {
	const [isSaving, setIsSaving] = useState(false);
	
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

	return (
		<div className="bg-white shadow rounded-lg">
			<div className="p-6 space-y-8">
				{/* Domain Verification */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-lg font-medium text-gray-900">
								Domain Verification
							</h4>
							<p className="text-sm text-gray-600">
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
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="domain-verification"
								className="ml-2 text-sm text-gray-700"
							>
								Enable domain verification
							</label>
						</div>
					</div>

					{domainVerificationEnabled && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-start">
								<Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
								<div>
									<h5 className="text-sm font-medium text-blue-800">
										How Domain Verification Works
									</h5>
									<p className="text-sm text-blue-700 mt-1">
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
						<Label className="text-sm font-medium text-gray-700">
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
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<span className="text-sm font-mono text-gray-900">
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
							<div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-sm text-yellow-800">
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
						<h4 className="text-lg font-medium text-gray-900">
							Widget Security Key
						</h4>
						<p className="text-sm text-gray-600">
							Secret key for HMAC verification. Keep this secure and never
							expose it in client-side code.
						</p>
					</div>

					<div className="space-y-3">
						<Label className="text-sm font-medium text-gray-700">
							Secret Key
						</Label>
						<div className="flex items-center gap-2">
							<div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm text-gray-900">
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

					<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
						<div className="flex items-start">
							<Info className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
							<div>
								<h5 className="text-sm font-medium text-orange-800">
									Keep Your Secret Key Safe
								</h5>
								<p className="text-sm text-orange-700 mt-1">
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
							<Label className="text-sm font-medium text-gray-700">
								Server Implementation Example
							</Label>
							<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
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
				<div className="flex justify-end pt-6 border-t border-gray-200">
					<Button onClick={handleSaveSecurity} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Security Settings"}
					</Button>
				</div>
			</div>
		</div>
	);
}