import '@testing-library/jest-dom/vitest';

// jsdom lacks a few browser APIs the app touches; provide harmless stubs.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || ResizeObserverStub;

if (!window.matchMedia) {
  (window as any).matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// The AI assistant and cloud sync call fetch; tests never want real network.
if (!(globalThis as any).fetch || process.env.VITEST) {
  (globalThis as any).fetch = async () =>
    new Response(JSON.stringify({ error: 'offline test stub', fallback: true }), { status: 503 });
}
