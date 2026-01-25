import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Ensure relative paths for Tauri production builds
  base: "./",

  // Build configuration
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Icons
            if (id.includes('lucide-react') || id.includes('@remixicon') || id.includes('simple-icons')) {
              return 'vendor-icons';
            }
            // Syntax highlighting
            if (id.includes('react-syntax-highlighter')) {
              return 'vendor-syntax';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // Other vendors
            return 'vendor-other';
          }
        },
      },
    },
    // Increase chunk size warning limit since Tauri apps are local
    chunkSizeWarningLimit: 5000,
    // Ensure compatibility with older WebKit versions on Linux
    target: "es2015",
    minify: false 
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
