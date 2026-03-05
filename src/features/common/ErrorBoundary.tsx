import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)]">
                    <div className="glass rounded-[2.5rem] p-10 max-w-lg w-full text-center space-y-6 soft-shadow border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-danger)]/5 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>

                        <div className="w-20 h-20 bg-[var(--color-danger)]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-10 h-10 text-[var(--color-danger)]" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Something went wrong</h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                We encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-[var(--color-pastel-purple)] text-white rounded-full font-bold flex items-center justify-center gap-2 soft-shadow hover:scale-[1.02] transition-transform"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="w-full py-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-pastel-hover)] transition-colors"
                            >
                                <Home className="w-5 h-5 opacity-70" />
                                Back to Safety
                            </button>
                        </div>

                        <pre className="mt-6 p-4 bg-black/5 rounded-xl text-left text-xs text-[var(--color-danger)] overflow-auto max-h-40 font-mono">
                            {this.state.error?.message}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
