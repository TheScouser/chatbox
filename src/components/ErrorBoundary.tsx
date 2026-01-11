import { AlertTriangle, Home, RefreshCcw, WifiOff } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
	children?: ReactNode;
	fallback?: ReactNode;
	/** Optional callback when an error is caught */
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	/** Whether to show a full-page error or inline error */
	fullPage?: boolean;
	/** Custom title for the error message */
	title?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorType: "network" | "runtime" | "unknown";
}

/**
 * Determines the type of error for appropriate UI feedback
 */
function getErrorType(error: Error): "network" | "runtime" | "unknown" {
	const message = error.message.toLowerCase();
	if (
		message.includes("network") ||
		message.includes("fetch") ||
		message.includes("failed to fetch") ||
		message.includes("connection") ||
		message.includes("offline")
	) {
		return "network";
	}
	if (
		error.name === "TypeError" ||
		error.name === "ReferenceError" ||
		error.name === "SyntaxError"
	) {
		return "runtime";
	}
	return "unknown";
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorType: "unknown",
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorType: getErrorType(error),
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught error:", error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: null, errorType: "unknown" });
	};

	private handleReload = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = "/dashboard";
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { errorType, error } = this.state;
			const { fullPage = false, title } = this.props;

			const isNetworkError = errorType === "network";

			const containerClasses = fullPage
				? "flex h-screen w-full flex-col items-center justify-center p-6"
				: "flex h-full w-full min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center animate-in fade-in zoom-in-95 duration-200";

			return (
				<div className={containerClasses}>
					<div className="max-w-md w-full space-y-6">
						{/* Icon */}
						<div className="flex justify-center">
							<div className="rounded-full bg-destructive/10 p-4">
								{isNetworkError ? (
									<WifiOff className="h-10 w-10 text-destructive" />
								) : (
									<AlertTriangle className="h-10 w-10 text-destructive" />
								)}
							</div>
						</div>

						{/* Title & Description */}
						<div className="space-y-2 text-center">
							<h3 className="text-xl font-semibold text-foreground">
								{title ||
									(isNetworkError
										? "Connection Problem"
										: "Something went wrong")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{isNetworkError
									? "We couldn't connect to the server. Please check your internet connection and try again."
									: error?.message || "An unexpected error occurred."}
							</p>
						</div>

						{/* Actions */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
							<Button
								onClick={this.handleRetry}
								variant="default"
								className="w-full sm:w-auto"
							>
								<RefreshCcw className="h-4 w-4 mr-2" />
								Try Again
							</Button>
							{fullPage && (
								<Button
									onClick={this.handleGoHome}
									variant="outline"
									className="w-full sm:w-auto"
								>
									<Home className="h-4 w-4 mr-2" />
									Go to Dashboard
								</Button>
							)}
						</div>

						{/* Additional Help Text */}
						<p className="text-xs text-muted-foreground text-center">
							If this problem persists, please{" "}
							<button
								type="button"
								onClick={this.handleReload}
								className="underline hover:text-foreground transition-colors"
							>
								reload the page
							</button>{" "}
							or contact support.
						</p>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * A simpler inline error display for non-critical errors
 */
interface InlineErrorProps {
	message: string;
	onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
	return (
		<div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
			<AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
			<span className="text-destructive flex-1">{message}</span>
			{onRetry && (
				<Button variant="ghost" size="sm" onClick={onRetry}>
					<RefreshCcw className="h-4 w-4 mr-1" />
					Retry
				</Button>
			)}
		</div>
	);
}

/**
 * Hook-friendly error display for Convex query errors
 */
interface QueryErrorProps {
	error: Error | null;
	onRetry?: () => void;
	className?: string;
}

export function QueryError({
	error,
	onRetry,
	className = "",
}: QueryErrorProps) {
	if (!error) return null;

	return (
		<div
			className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
		>
			<div className="rounded-full bg-destructive/10 p-3 mb-4">
				<AlertTriangle className="h-8 w-8 text-destructive" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">
				Failed to load data
			</h3>
			<p className="text-sm text-muted-foreground mb-4 max-w-sm">
				{error.message ||
					"Something went wrong while loading. Please try again."}
			</p>
			{onRetry && (
				<Button variant="outline" onClick={onRetry}>
					<RefreshCcw className="h-4 w-4 mr-2" />
					Try Again
				</Button>
			)}
		</div>
	);
}
