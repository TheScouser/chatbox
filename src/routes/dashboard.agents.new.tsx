import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft, Bot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import {
	useFormValidation,
	validators,
	type ValidationSchema,
	type ValidationRule,
} from "../hooks/useFormValidation";
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

// Validation schema will be created inside component to access translations

type CreateAgentFormData = {
	name: string;
	description: string;
};

function CreateAgent() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { currentOrganization } = useOrganization();
	const createAgent = useMutation(api.agents.createAgent);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Validation schema for create agent form
	const createAgentSchema: ValidationSchema = {
		name: {
			required: true,
			requiredMessage: t("agents.new.agentNameRequired"),
			rules: [
				validators.minLength(2, t("agents.new.agentNameMinLength")),
				validators.maxLength(50, t("agents.new.agentNameMaxLength")),
			] as ValidationRule<unknown>[],
		},
		description: {
			required: false,
			rules: [
				validators.maxLength(500, t("agents.new.descriptionMaxLength")),
			] as ValidationRule<unknown>[],
		},
	};

	// Form validation
	const validation = useFormValidation<CreateAgentFormData>(createAgentSchema);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		// Validate form
		const { isValid } = validation.validateForm(formData);
		if (!isValid) return;

		// Check organization
		if (!currentOrganization?._id) {
			setSubmitError(t("agents.new.noOrgError"));
			return;
		}

		setIsSubmitting(true);

		try {
			await createAgent({
				organizationId: currentOrganization._id,
				name: formData.name.trim(),
				description: formData.description.trim() || undefined,
			});

			// Navigate back to agents list
			navigate({ to: "/dashboard/agents" });
		} catch (error) {
			console.error("Failed to create agent:", error);
			setSubmitError(
				error instanceof Error ? error.message : t("agents.new.createError"),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: "name" | "description", value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		validation.handleChange(field);
		if (submitError) setSubmitError(null);
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
						{t("agents.new.backToAgents")}
					</Button>
				</div>

				{submitError && (
					<div className="mb-6 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
						<p className="text-sm text-destructive">{submitError}</p>
					</div>
				)}

				<FormCard
					title={t("agents.new.title")}
					description={t("agents.new.description")}
					icon={Bot}
				>
					<form onSubmit={handleSubmit}>
						<FormSection>
							<FormField
								label={t("agents.new.agentName")}
								required
								error={validation.getFieldError("name")}
								hint={`${formData.name.length}/50 ${t("common.characters")}`}
							>
								<Input
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									onBlur={() =>
										validation.handleBlur("name", formData.name, formData)
									}
									placeholder={t("agents.new.agentNamePlaceholder")}
									maxLength={50}
									aria-invalid={Boolean(validation.getFieldError("name"))}
								/>
							</FormField>

							<FormField
								label={t("agents.new.descriptionLabel")}
								error={validation.getFieldError("description")}
								hint={`${formData.description.length}/500 ${t("common.characters")}`}
							>
								<Textarea
									rows={4}
									value={formData.description}
									onChange={(e) =>
										handleInputChange("description", e.target.value)
									}
									onBlur={() =>
										validation.handleBlur(
											"description",
											formData.description,
											formData,
										)
									}
									placeholder={t("agents.new.descriptionPlaceholder")}
									maxLength={500}
									aria-invalid={Boolean(
										validation.getFieldError("description"),
									)}
								/>
							</FormField>
						</FormSection>

						<FormActions>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/dashboard/agents" })}
							>
								{t("agents.new.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? t("agents.new.creating")
									: t("agents.new.create")}
							</Button>
						</FormActions>
					</form>
				</FormCard>
			</div>
		</PageLayout>
	);
}
