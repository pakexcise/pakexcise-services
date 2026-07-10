"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type SectionErrorBoundaryProps = {
  name: string;
  children: ReactNode;
};

type SectionErrorBoundaryState = {
  hasError: boolean;
};

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[homepage] section boundary ${this.props.name}`, error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
