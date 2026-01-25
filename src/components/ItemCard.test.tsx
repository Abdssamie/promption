/**
 * ItemCard Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, createMockItem, createMockTags } from '../tests/test-utils';
import { ItemCard } from './ItemCard';
import { useAppStore } from '../store/appStore';

// Mock the store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

describe('ItemCard', () => {
    const mockToggleSelect = vi.fn();
    const mockSetEditing = vi.fn();
    const mockDeleteItem = vi.fn();

    beforeEach(() => {
        vi.mocked(useAppStore).mockImplementation((selector) => {
            const state = {
                selectedItems: new Set<string>(),
                toggleSelect: mockToggleSelect,
                setEditing: mockSetEditing,
                deleteItem: mockDeleteItem,
            };
            return selector(state as any);
        });
        mockToggleSelect.mockClear();
        mockSetEditing.mockClear();
        mockDeleteItem.mockClear();
    });

    describe('Rendering', () => {
        it('should render item name', () => {
            const item = createMockItem({ name: 'My Test Skill' });
            render(<ItemCard item={item} />);
            expect(screen.getByText('My Test Skill')).toBeInTheDocument();
        });

        it('should render item type badge', () => {
            const item = createMockItem({ item_type: 'skill' });
            render(<ItemCard item={item} />);
            expect(screen.getByText('Skill')).toBeInTheDocument();
        });

        it('should render content preview', () => {
            const item = createMockItem({ content: 'This is the item content' });
            render(<ItemCard item={item} />);
            expect(screen.getByText(/This is the item content/)).toBeInTheDocument();
        });

        it('should render tags when present', () => {
            const tags = createMockTags(2);
            const item = createMockItem({ tags });
            render(<ItemCard item={item} />);

            tags.forEach((tag) => {
                expect(screen.getByText(tag.name)).toBeInTheDocument();
            });
        });

        it('should not render tags section when no tags', () => {
            const item = createMockItem({ tags: [] });
            const { container } = render(<ItemCard item={item} />);
            // Check that there's no tag elements (spans with tag colors)
            expect(container.querySelectorAll('[class*="rounded-full"]').length).toBe(0);
        });

        it('should show checkbox unchecked for unselected item', () => {
            const item = createMockItem();
            const { container } = render(<ItemCard item={item} />);
            // Check should not have the accent background when not selected
            const checkbox = container.querySelector('[class*="border-2"]');
            expect(checkbox).not.toHaveClass('bg-accent');
        });
    });

    describe('Selection', () => {
        it('should show selected state with ring', () => {
            const item = createMockItem();

            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    selectedItems: new Set([item.id]),
                    toggleSelect: mockToggleSelect,
                    setEditing: mockSetEditing,
                    deleteItem: mockDeleteItem,
                };
                return selector(state as any);
            });

            const { container } = render(<ItemCard item={item} />);
            const card = container.firstChild;
            expect(card).toHaveClass('ring-2');
        });

        it('should call toggleSelect when checkbox is clicked', async () => {
            const user = userEvent.setup();
            const item = createMockItem();
            const { container } = render(<ItemCard item={item} />);

            const checkboxArea = container.querySelector('.absolute.top-3.left-3');
            expect(checkboxArea).toBeInTheDocument();

            await user.click(checkboxArea!);
            expect(mockToggleSelect).toHaveBeenCalledWith(item.id);
        });
    });

    describe('User Interactions', () => {
        it('should call setEditing when card is clicked', async () => {
            const user = userEvent.setup();
            const item = createMockItem();
            const { container } = render(<ItemCard item={item} />);

            const card = container.firstChild as HTMLElement;
            await user.click(card);
            expect(mockSetEditing).toHaveBeenCalledWith(item);
        });

        it('should call deleteItem when delete is confirmed', async () => {
            const user = userEvent.setup();
            const item = createMockItem({ name: 'Item to Delete' });
            const { container } = render(<ItemCard item={item} />);

            // Find delete button (second button)
            const buttons = container.querySelectorAll('button');
            const deleteButton = buttons[1];

            await user.click(deleteButton);

            expect(mockDeleteItem).toHaveBeenCalledWith(item.id);
        });
    });

    describe('Different Item Types', () => {
        it('should render skill type correctly', () => {
            const item = createMockItem({ item_type: 'skill' });
            render(<ItemCard item={item} />);
            expect(screen.getByText('Skill')).toBeInTheDocument();
        });

        it('should render rule type correctly', () => {
            const item = createMockItem({ item_type: 'rule' });
            render(<ItemCard item={item} />);
            expect(screen.getByText('Rule')).toBeInTheDocument();
        });

        it('should render workflow type correctly', () => {
            const item = createMockItem({ item_type: 'workflow' });
            render(<ItemCard item={item} />);
            expect(screen.getByText('Workflow')).toBeInTheDocument();
        });
    });

    describe('Content Truncation', () => {
        it('should truncate long content', () => {
            const longContent = 'a'.repeat(500);
            const item = createMockItem({ content: longContent });
            render(<ItemCard item={item} />);

            // The content should be truncated (showing ... at the end)
            // and wrapped in the syntax highlighter
            const contentArea = screen.getByText(/a+\.\.\.$/);
            expect(contentArea).toBeInTheDocument();
        });
    });
});
