// Registra los matchers de jest-dom (toBeInTheDocument, etc.) en el expect de Vitest.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM tras cada test (necesario porque no usamos los globals de Vitest,
// así que el auto-cleanup de Testing Library no se registra por sí solo).
afterEach(() => {
  cleanup();
});
