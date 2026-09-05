declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      captureException?: (error: Error, properties?: Record<string, unknown>) => void;
    };
  }
}

export {};
