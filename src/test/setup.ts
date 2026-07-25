import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM renderizado después de cada test.
afterEach(() => {
  cleanup();
});
