import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft, Bot } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import {
	FormActions,
	FormCard,
	FormField,
	FormSection,
} from "../components/ui/form-card";
import { Input } from "../components/ui/input";
import { PageLayout } from "../components/ui/layout";
import { Textarea } from "../components/ui/textarea";

import { useOrganization } from "../contexts/OrganizationContext";

export const Route = createFileRoute("/dashboard/agents/new")({
	component: CreateAgent,
});

function CreateAgent() {
	const navigate = useNavigate();
	const { currentOrganization } = useOrganization();
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
			if (!currentOrganization?._id) {
				setErrors({ name: "No organization selected" });
				return;
			}

			await createAgent({
				organizationId: currentOrganization._id,
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
		<PageLayout>
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center space-x-4">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/dashboard/agents" })}
						className="text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Agents
					</Button>
				</div>

				<FormCard
					title="Create New Agent"
					description="Set up your AI agent with a name and description"
					icon={Bot}
				>
					<form onSubmit={handleSubmit}>
						<FormSection>
							<FormField
								label="Agent Name"
								required
								error={errors.name}
								hint={`${formData.name.length}/50 characters`}
							>
								<Input
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="e.g., Customer Support Bot, Sales Assistant"
									maxLength={50}
								/>
							</FormField>

							<FormField
								label="Description (Optional)"
								error={errors.description}
								hint={`${formData.description.length}/500 characters`}
							>
								<Textarea
									rows={4}
									value={formData.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									placeholder="Describe what this agent will help with..."
									maxLength={500}
								/>
							</FormField>
						</FormSection>

						<FormActions>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/dashboard/agents" })}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !formData.name.trim()}
							>
								{isSubmitting ? "Creating..." : "Create Agent"}
							</Button>
						</FormActions>
					</form>
				</FormCard>
			</div>
		</PageLayout>
	);
}
