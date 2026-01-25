/**
 * Vitest Test Setup
 * This file runs before each test file to configure the testing environment.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test to prevent state leakage
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// Mock the Tauri APIs
beforeAll(() => {
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: vi.fn().mockResolvedValue(undefined),
            readText: vi.fn().mockResolvedValue(''),
        },
        writable: true,
        configurable: true,
    });

    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn(() => true));

    // Mock CSS properties for tests
    vi.stubGlobal('getComputedStyle', () => ({
        getPropertyValue: () => '',
    }));

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Mock ResizeObserver
    vi.stubGlobal(
        'ResizeObserver',
        vi.fn(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }))
    );
});
