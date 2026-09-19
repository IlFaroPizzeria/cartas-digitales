import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Sin plugin de React: esbuild ya transforma JSX/TSX automáticamente
// (usa el jsx-runtime, igual que el tsconfig del proyecto), y así se
// evita un conflicto de versiones de "vite" entre la que arrastra
// @vitejs/plugin-react y la que trae vitest empaquetada.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
