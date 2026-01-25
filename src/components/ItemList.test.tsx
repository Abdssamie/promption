/**
 * ItemList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, createMockItems } from '../tests/test-utils';
import { ItemList } from './ItemList';
import { useAppStore } from '../store/appStore';

// Mock the store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

// Mock ItemCard to simplify testing
vi.mock('./ItemCard', () => ({
    ItemCard: ({ item }: { item: { name: string } }) => (
        <div data-testid={`item-card-${item.name}`}>{item.name}</div>
    ),
}));

describe('ItemList', () => {
    const mockItems = createMockItems(3);

    beforeEach(() => {
        vi.mocked(useAppStore).mockImplementation((selector) => {
            const state = {
                isLoading: false,
                getFilteredItems: () => mockItems,
            };
            return selector(state as any);
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when isLoading is true', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    isLoading: true,
                    getFilteredItems: () => [],
                };
                return selector(state as any);
            });

            const { container } = render(<ItemList />);
            // Check for the loading spinner (Loader2 from lucide)
            expect(container.querySelector('.animate-spin')).toBeInTheDocument();
        });

        it('should not show loading spinner when isLoading is false', () => {
            const { container } = render(<ItemList />);
            expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no items', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    isLoading: false,
                    getFilteredItems: () => [],
                };
                return selector(state as any);
            });

            render(<ItemList />);
            expect(screen.getByText('No items found')).toBeInTheDocument();
            expect(
                screen.getByText(/Create a new skill, rule, or workflow/i)
            ).toBeInTheDocument();
        });

        it('should show FileText icon in empty state', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    isLoading: false,
                    getFilteredItems: () => [],
                };
                return selector(state as any);
            });

            const { container } = render(<ItemList />);
            // FileText icon should be present
            expect(container.querySelector('svg')).toBeInTheDocument();
        });
    });

    describe('Rendering Items', () => {
        it('should render all items', () => {
            render(<ItemList />);

            mockItems.forEach((item) => {
                expect(screen.getByTestId(`item-card-${item.name}`)).toBeInTheDocument();
            });
        });

        it('should render correct number of items', () => {
            render(<ItemList />);

            const itemCards = screen.getAllByTestId(/item-card-/);
            expect(itemCards.length).toBe(3);
        });

        it('should render items in grid layout', () => {
            const { container } = render(<ItemList />);
            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3');
        });
    });

    describe('Filtered Items', () => {
        it('should only render filtered items', () => {
            const filteredItems = createMockItems(2);

            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    isLoading: false,
                    getFilteredItems: () => filteredItems,
                };
                return selector(state as any);
            });

            render(<ItemList />);

            const itemCards = screen.getAllByTestId(/item-card-/);
            expect(itemCards.length).toBe(2);
        });

        it('should show empty state when filter results in no items', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    isLoading: false,
                    getFilteredItems: () => [],
                };
                return selector(state as any);
            });

            render(<ItemList />);
            expect(screen.getByText('No items found')).toBeInTheDocument();
        });
    });
});
