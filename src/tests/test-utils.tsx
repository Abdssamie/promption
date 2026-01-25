/**
 * Test Utilities and Mock Factories
 * Provides helper functions for creating test data and rendering components.
 */

import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import type { Item, Tag, ItemType } from '../types';

// ============================================================================
// Mock Factories - Creating test data following Factory Pattern
// ============================================================================

/**
 * Creates a mock Tag with sensible defaults.
 * Override any property by passing it in the override object.
 */
export function createMockTag(override: Partial<Tag> = {}): Tag {
    return {
        id: `tag-${Math.random().toString(36).slice(2, 11)}`,
        name: 'Test Tag',
        color: '#6366f1',
        ...override,
    };
}

/**
 * Creates a mock Item with sensible defaults.
 * Override any property by passing it in the override object.
 */
export function createMockItem(override: Partial<Item> = {}): Item {
    const now = new Date().toISOString();
    return {
        id: `item-${Math.random().toString(36).slice(2, 11)}`,
        name: 'Test Item',
        content: 'This is test content for the item.',
        item_type: 'skill' as ItemType,
        created_at: now,
        updated_at: now,
        tags: [],
        ...override,
    };
}

/**
 * Creates multiple mock items with optional configuration.
 */
export function createMockItems(
    count: number,
    typeConfig?: ItemType | ((index: number) => Partial<Item>)
): Item[] {
    return Array.from({ length: count }, (_, index) => {
        const override =
            typeof typeConfig === 'function'
                ? typeConfig(index)
                : typeConfig
                    ? { item_type: typeConfig }
                    : {};

        return createMockItem({
            name: `Item ${index + 1}`,
            ...override,
        });
    });
}

/**
 * Creates multiple mock tags.
 */
export function createMockTags(count: number): Tag[] {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];
    return Array.from({ length: count }, (_, index) =>
        createMockTag({
            name: `Tag ${index + 1}`,
            color: colors[index % colors.length],
        })
    );
}

// ============================================================================
// Test Date Utilities
// ============================================================================

/**
 * Creates a date string relative to now.
 * Useful for testing date formatting functions.
 */
export function createTestDate(
    offset: { minutes?: number; hours?: number; days?: number } = {}
): string {
    const now = new Date();
    if (offset.minutes) now.setMinutes(now.getMinutes() - offset.minutes);
    if (offset.hours) now.setHours(now.getHours() - offset.hours);
    if (offset.days) now.setDate(now.getDate() - offset.days);
    return now.toISOString();
}

// ============================================================================
// Custom Render Functions
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    // Add any context providers or custom options here
    initialStore?: Partial<{
        items: Item[];
        tags: Tag[];
        searchQuery: string;
        typeFilter: ItemType | null;
        tagFilter: string[];
        isLoading: boolean;
    }>;
}

/**
 * Custom render function that wraps components with all necessary providers.
 * Extend this to add context providers as needed.
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initialStore, ...renderOptions } = options;

    function Wrapper({ children }: { children: ReactNode }) {
        // Add providers here if needed (e.g., ThemeProvider, etc.)
        return <>{children}</>;
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render with our custom render
export { customRender as render };

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Helper to wait for all pending promises to resolve.
 * Useful when testing async operations.
 */
export async function waitForPromises(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
}
