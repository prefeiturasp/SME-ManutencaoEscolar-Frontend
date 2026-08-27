import "@testing-library/jest-dom/vitest";

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {
      // noop: jsdom não implementa ResizeObserver (necessário para cmdk)
    }

    unobserve() {
      // noop
    }

    disconnect() {
      // noop
    }
  };
}

if (typeof window !== "undefined") {
  Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });

  Object.defineProperty(window.HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: () => undefined,
  });

  Object.defineProperty(window.HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: () => undefined,
  });

  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => undefined,
  });

  Object.defineProperty(window.Element.prototype, "scrollIntoView", {
    configurable: true,
    value: () => undefined,
  });
}
