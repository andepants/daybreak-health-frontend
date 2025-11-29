/**
 * Error Boundary Component
 *
 * React Error Boundary for graceful error handling.
 * Catches JavaScript errors in child components and displays fallback UI.
 *
 * Features:
 * - Friendly error message with Daybreak styling
 * - "Try Again" button to reset and retry
 * - Console logging in development (stub for future error tracking)
 */
"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Props for the ErrorBoundary component
 * @param children - Child components to wrap
 * @param fallback - Optional custom fallback component
 * @param className - Additional CSS classes for the fallback container
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary class component
 * Catches errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error information (development only, stub for future error tracking)
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Error info:", errorInfo);
    }

    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  /**
   * Reset error state to retry rendering children
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, className } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center min-h-[200px] p-6",
            "text-center",
            className
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-4">
            <AlertTriangle
              className="w-8 h-8 text-error"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-serif">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            We encountered an unexpected error. Please try again, or contact
            support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && error && (
            <pre className="text-xs text-error bg-error/5 p-3 rounded-md mb-4 max-w-full overflow-auto">
              {error.message}
            </pre>
          )}
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      );
    }

    return children;
  }
}

export { ErrorBoundary };
export type { ErrorBoundaryProps };
