"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
};

export class ProductErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error al renderizar un producto:", error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="aspect-[4/5] bg-zinc-100" />
        <div className="space-y-2 p-3 sm:p-4">
          <div className="h-4 w-4/5 rounded-full bg-zinc-200" />
          <div className="h-3 w-1/2 rounded-full bg-zinc-200" />
          <div className="h-3 w-1/3 rounded-full bg-zinc-200" />
        </div>
      </div>
    );
  }
}
