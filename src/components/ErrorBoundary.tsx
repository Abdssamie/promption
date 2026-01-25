import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
        // Alert in production to ensure visibility
        alert("React ErrorBoundary Caught: " + error.toString());
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-2xl mx-auto bg-white text-black font-mono">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Application Error</h1>
                    <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto border border-gray-300">
                        <p className="font-bold">{this.state.error?.toString()}</p>
                    </div>
                    <details className="whitespace-pre-wrap text-sm text-gray-700">
                        <summary className="cursor-pointer mb-2 font-medium">Component Stack</summary>
                        {this.state.errorInfo?.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
