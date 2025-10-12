import '@testing-library/jest-dom/vitest';

class TestResizeObserver implements ResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {
    // no-op for tests
  }

  observe(): void {
    // Trigger once so components relying on measurements can proceed
    this.callback([], this);
  }

  unobserve(): void {
    // no-op for tests
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  // Provide a minimal ResizeObserver so headless UI components mount in tests
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    TestResizeObserver as unknown as typeof ResizeObserver;
}
