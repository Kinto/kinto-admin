/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/**
 * used to set the relative path from which we expect to serve the admin's
 * static bundle on the server:
 *    GH Pages:     /kinto-admin/
 *    Kinto plugin: /v1/admin/
 */
const ASSET_PATH = process.env.ASSET_PATH || "/";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  envPrefix: 'KINTO_ADMIN',
  plugins: [react()],
  base: ASSET_PATH,  
  define: {
    KINTO_ADMIN_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: "build"
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*_{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: ["test/setupTests.js"]
  }
})
