/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import path from 'path'

/**
 * used to set the relative path from which we expect to serve the admin's
 * static bundle on the server:
 *    GH Pages:     /kinto-admin/
 *    Kinto plugin: /v1/admin/
 */
const ASSET_PATH = process.env.ASSET_PATH || "/";

const KINTO_ADMIN_VERSION = readFileSync('./public/VERSION').toString();

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  envPrefix: 'KINTO_ADMIN',
  plugins: [react()],
  base: ASSET_PATH,  
  define: {
    KINTO_ADMIN_VERSION: JSON.stringify(KINTO_ADMIN_VERSION)
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test')
    }
  },
  build: {
    outDir: "build"
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*_{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: ["test/setupTests.ts"],
    coverage: {
      include: ["src/**"]
    }
  }
})
