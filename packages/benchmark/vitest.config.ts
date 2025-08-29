import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  name: 'ebin-benchmark',
  test: {
    globals: true,
  },
}));
