import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/**
 * Vite configuration file for the frontend application.
 * 
 * Configures the React plugin, development server with API proxy, and build output directory.
 * 
 * @type {import('vite').UserConfig}
 * @property {Array}  plugins           - Array of Vite plugins, includes React plugin for JSX transformation
 * @property {Object} server            - Development server configuration
 * @property {Object} server.proxy      - Proxy configuration for API requests
 * @property {string} server.proxy./api - Proxies all /api requests to the backend server at http://localhost:8080
 * @property {Object} build             - Build configuration
 * @property {string} build.outDir      - Output directory for production build files (set to 'build')
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  build: {
    outDir: 'build'
  }
});
