/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        // Environment
        environment: 'happy-dom',

        // Setup files
        setupFiles: ['./src/tests/setup.ts'],

        // Include patterns
        include: ['src/**/*.{test,spec}.{ts,tsx}'],

        // Exclude patterns
        exclude: ['node_modules', 'dist', 'src-tauri'],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'src/tests/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/vite-env.d.ts',
            ],
        },

        // Reporter
        reporters: ['verbose'],

        // Global API (describe, it, expect available globally)
        globals: true,

        // CSS handling
        css: true,
    },
});
