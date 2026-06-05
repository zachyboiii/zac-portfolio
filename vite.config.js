import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/zac-portfolio",
  optimizeDeps: {
    // @mediapipe/tasks-vision loads WASM files dynamically at runtime.
    // Vite's pre-bundler breaks WASM loading by trying to inline the binary,
    // which causes the FilesetResolver to fail silently in dev mode.
    // Excluding it tells Vite to serve the package as-is (no transformation).
    exclude: ['@mediapipe/tasks-vision'],
  },
  server: {
    // vision_bundle.mjs references a .map file that the package doesn't ship.
    // This silences the "Failed to load source map" noise in the dev console.
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
})
