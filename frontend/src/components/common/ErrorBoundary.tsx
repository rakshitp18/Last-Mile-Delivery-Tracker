import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error caught by Ship It ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 text-white sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4">
              <AlertTriangle className="h-7 w-7 animate-pulse" />
            </div>

            <h1 className="text-xl font-black tracking-tight text-white">Something went wrong</h1>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              An unexpected application error occurred. The application state has been preserved safely.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-xl bg-slate-900/90 p-3 text-left border border-slate-800 text-[11px] font-mono text-rose-300 max-h-28 overflow-y-auto">
                {this.state.error.message || 'Unknown runtime exception'}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-orange-500 transition"
              >
                <RefreshCw className="h-4 w-4" /> Reload View
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                <Home className="h-4 w-4" /> Back to Safety
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
