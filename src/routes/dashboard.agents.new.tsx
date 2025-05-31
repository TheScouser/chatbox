import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import DashboardLayout from "../components/DashboardLayout";
import { useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";

export const Route = createFileRoute("/dashboard/agents/new")({
	component: CreateAgent,
});

function CreateAgent() {
	const navigate = useNavigate();
	const createAgent = useMutation(api.agents.createAgent);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ name?: string; description?: string }>(
		{},
	);

	const validateForm = () => {
		const newErrors: { name?: string; description?: string } = {};

		if (!formData.name.trim()) {
			newErrors.name = "Agent name is required";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Agent name must be at least 2 characters";
		} else if (formData.name.trim().length > 50) {
			newErrors.name = "Agent name must be less than 50 characters";
		}

		if (formData.description && formData.description.length > 500) {
			newErrors.description = "Description must be less than 500 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			await createAgent({
				name: formData.name.trim(),
				description: formData.description.trim() || undefined,
			});

			// Navigate back to agents list
			navigate({ to: "/dashboard/agents" });
		} catch (error) {
			console.error("Failed to create agent:", error);
			setErrors({ name: "Failed to create agent. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: "name" | "description", value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<Authenticated>
			<DashboardLayout>
				<div className="max-w-2xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center space-x-4">
						<button
							onClick={() => navigate({ to: "/dashboard/agents" })}
							className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
						>
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back to Agents
						</button>
					</div>

					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex items-center">
								<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
									<Bot className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<h1 className="text-xl font-semibold text-gray-900">
										Create New Agent
									</h1>
									<p className="text-sm text-gray-600">
										Set up your AI agent with a name and description
									</p>
								</div>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							{/* Agent Name */}
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Agent Name *
								</label>
								<input
									type="text"
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
										errors.name ? "border-red-300" : "border-gray-300"
									}`}
									placeholder="e.g., Customer Support Bot, Sales Assistant"
									maxLength={50}
								/>
								{errors.name && (
									<p className="mt-1 text-sm text-red-600">{errors.name}</p>
								)}
								<p className="mt-1 text-sm text-gray-500">
									{formData.name.length}/50 characters
								</p>
							</div>

							{/* Agent Description */}
							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Description (Optional)
								</label>
								<textarea
									id="description"
									rows={4}
									value={formData.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
										errors.description ? "border-red-300" : "border-gray-300"
									}`}
									placeholder="Describe what this agent will help with..."
									maxLength={500}
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600">
										{errors.description}
									</p>
								)}
								<p className="mt-1 text-sm text-gray-500">
									{formData.description.length}/500 characters
								</p>
							</div>

							{/* Form Actions */}
							<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
								<button
									type="button"
									onClick={() => navigate({ to: "/dashboard/agents" })}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting || !formData.name.trim()}
									className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? "Creating..." : "Create Agent"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</DashboardLayout>
		</Authenticated>
	);
}
