import '@testing-library/jest-dom';

// Global ResizeObserver mock for Recharts responsive containers in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
