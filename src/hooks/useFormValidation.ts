import { useCallback, useState } from "react";

/**
 * Validation rule type
 */
export type ValidationRule<T> = {
	validate: (value: T, formData?: Record<string, unknown>) => boolean;
	message: string;
};

/**
 * Field validation configuration
 */
export type FieldValidation<T = string> = {
	required?: boolean;
	requiredMessage?: string;
	rules?: ValidationRule<T>[];
};

/**
 * Form validation schema
 */
export type ValidationSchema = Record<string, FieldValidation<unknown>>;

/**
 * Form errors type
 */
export type FormErrors<T extends Record<string, unknown>> = Partial<
	Record<keyof T, string>
>;

/**
 * Common validation rules factory
 */
export const validators = {
	/**
	 * Minimum length validation
	 */
	minLength: (min: number, message?: string): ValidationRule<string> => ({
		validate: (value) => !value || value.length >= min,
		message: message || `Must be at least ${min} characters`,
	}),

	/**
	 * Maximum length validation
	 */
	maxLength: (max: number, message?: string): ValidationRule<string> => ({
		validate: (value) => !value || value.length <= max,
		message: message || `Must be no more than ${max} characters`,
	}),

	/**
	 * Email format validation
	 */
	email: (message?: string): ValidationRule<string> => ({
		validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
		message: message || "Please enter a valid email address",
	}),

	/**
	 * URL format validation
	 */
	url: (message?: string): ValidationRule<string> => ({
		validate: (value) => {
			if (!value) return true;
			try {
				new URL(value);
				return true;
			} catch {
				return false;
			}
		},
		message: message || "Please enter a valid URL",
	}),

	/**
	 * Pattern/regex validation
	 */
	pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
		validate: (value) => !value || regex.test(value),
		message,
	}),

	/**
	 * Numeric validation
	 */
	numeric: (message?: string): ValidationRule<string> => ({
		validate: (value) => !value || /^\d+$/.test(value),
		message: message || "Must be a number",
	}),

	/**
	 * Minimum value validation (for numbers)
	 */
	min: (min: number, message?: string): ValidationRule<number> => ({
		validate: (value) => value === undefined || value === null || value >= min,
		message: message || `Must be at least ${min}`,
	}),

	/**
	 * Maximum value validation (for numbers)
	 */
	max: (max: number, message?: string): ValidationRule<number> => ({
		validate: (value) => value === undefined || value === null || value <= max,
		message: message || `Must be no more than ${max}`,
	}),

	/**
	 * Custom validation function
	 */
	custom: <T>(
		validateFn: (value: T, formData?: Record<string, unknown>) => boolean,
		message: string,
	): ValidationRule<T> => ({
		validate: validateFn,
		message,
	}),
};

/**
 * Validate a single field value
 */
function validateField<T>(
	value: T,
	validation: FieldValidation<T>,
	formData?: Record<string, unknown>,
): string | undefined {
	// Check required
	if (validation.required) {
		const isEmpty =
			value === undefined ||
			value === null ||
			(typeof value === "string" && value.trim() === "") ||
			(Array.isArray(value) && value.length === 0);

		if (isEmpty) {
			return validation.requiredMessage || "This field is required";
		}
	}

	// Check additional rules
	if (validation.rules) {
		for (const rule of validation.rules) {
			if (!rule.validate(value, formData)) {
				return rule.message;
			}
		}
	}

	return undefined;
}

/**
 * Hook for form validation
 */
export function useFormValidation<T extends Record<string, unknown>>(
	schema: ValidationSchema,
) {
	const [errors, setErrors] = useState<FormErrors<T>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

	/**
	 * Validate a single field
	 */
	const validateSingleField = useCallback(
		(fieldName: keyof T, value: unknown, formData?: T): string | undefined => {
			const fieldSchema = schema[fieldName as string];
			if (!fieldSchema) return undefined;
			return validateField(
				value,
				fieldSchema as FieldValidation<typeof value>,
				formData,
			);
		},
		[schema],
	);

	/**
	 * Validate entire form
	 */
	const validateForm = useCallback(
		(formData: T): { isValid: boolean; errors: FormErrors<T> } => {
			const newErrors: FormErrors<T> = {};
			let isValid = true;

			for (const [fieldName, fieldSchema] of Object.entries(schema)) {
				const value = formData[fieldName as keyof T];
				const error = validateField(
					value,
					fieldSchema as FieldValidation<typeof value>,
					formData,
				);
				if (error) {
					newErrors[fieldName as keyof T] = error;
					isValid = false;
				}
			}

			setErrors(newErrors);
			return { isValid, errors: newErrors };
		},
		[schema],
	);

	/**
	 * Handle field blur - validate on blur
	 */
	const handleBlur = useCallback(
		(fieldName: keyof T, value: unknown, formData?: T) => {
			setTouched((prev) => ({ ...prev, [fieldName]: true }));
			const error = validateSingleField(fieldName, value, formData);
			setErrors((prev) => ({
				...prev,
				[fieldName]: error,
			}));
		},
		[validateSingleField],
	);

	/**
	 * Handle field change - clear error when user starts typing
	 */
	const handleChange = useCallback(
		(fieldName: keyof T) => {
			if (errors[fieldName]) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[fieldName];
					return newErrors;
				});
			}
		},
		[errors],
	);

	/**
	 * Clear all errors
	 */
	const clearErrors = useCallback(() => {
		setErrors({});
		setTouched({});
	}, []);

	/**
	 * Clear specific field error
	 */
	const clearFieldError = useCallback((fieldName: keyof T) => {
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[fieldName];
			return newErrors;
		});
	}, []);

	/**
	 * Set a specific error manually
	 */
	const setFieldError = useCallback((fieldName: keyof T, message: string) => {
		setErrors((prev) => ({
			...prev,
			[fieldName]: message,
		}));
	}, []);

	/**
	 * Check if form has any errors
	 */
	const hasErrors = Object.keys(errors).length > 0;

	/**
	 * Check if a specific field has been touched and has an error
	 */
	const getFieldError = useCallback(
		(fieldName: keyof T): string | undefined => {
			return touched[fieldName] ? errors[fieldName] : undefined;
		},
		[errors, touched],
	);

	return {
		errors,
		touched,
		hasErrors,
		validateForm,
		validateSingleField,
		handleBlur,
		handleChange,
		clearErrors,
		clearFieldError,
		setFieldError,
		getFieldError,
		setErrors,
		setTouched,
	};
}

/**
 * Helper type for form field props with validation
 */
export interface ValidatedFieldProps {
	error?: string;
	onBlur?: () => void;
	onChange?: () => void;
}

/**
 * Create validated field props from the validation hook
 */
export function createFieldProps<T extends Record<string, unknown>>(
	fieldName: keyof T,
	validation: ReturnType<typeof useFormValidation<T>>,
	formData: T,
): ValidatedFieldProps {
	return {
		error: validation.getFieldError(fieldName),
		onBlur: () =>
			validation.handleBlur(fieldName, formData[fieldName], formData),
		onChange: () => validation.handleChange(fieldName),
	};
}
