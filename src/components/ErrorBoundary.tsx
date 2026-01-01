import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex h-full w-full min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="rounded-full bg-destructive/10 p-3">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            Something went wrong
                        </h3>
                        <p className="max-w-[400px] text-sm text-muted-foreground">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Reload Page</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
