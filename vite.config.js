import { defineConfig } from 'vite';

export default defineConfig({
  base: '/claude-game-experiment/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 8080,
  },
});
