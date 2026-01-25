/**
 * TagFilter Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../tests/test-utils';
import { TagFilter } from './TagFilter';
import { useAppStore } from '../store/appStore';
import { createMockTags } from '../tests/test-utils';

// Mock the store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

describe('TagFilter', () => {
    const mockSetTagFilter = vi.fn();
    const mockTags = createMockTags(3);

    beforeEach(() => {
        vi.mocked(useAppStore).mockImplementation((selector) => {
            const state = {
                tags: mockTags,
                tagFilter: [],
                setTagFilter: mockSetTagFilter,
            };
            return selector(state as any);
        });
        mockSetTagFilter.mockClear();
    });

    describe('Rendering', () => {
        it('should render all available tags', () => {
            render(<TagFilter />);

            mockTags.forEach((tag) => {
                expect(screen.getByRole('button', { name: tag.name })).toBeInTheDocument();
            });
        });

        it('should not render anything when there are no tags', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    tags: [],
                    tagFilter: [],
                    setTagFilter: mockSetTagFilter,
                };
                return selector(state as any);
            });

            const { container } = render(<TagFilter />);
            expect(container.firstChild).toBeNull();
        });

        it('should apply tag color styling', () => {
            render(<TagFilter />);
            const tagButton = screen.getByRole('button', { name: mockTags[0].name });
            // Check that the style attribute contains the expected color
            expect(tagButton.getAttribute('style')).toContain(mockTags[0].color);
        });
    });

    describe('User Interactions', () => {
        it('should add tag to filter when unselected tag is clicked', async () => {
            const user = userEvent.setup();
            render(<TagFilter />);

            await user.click(screen.getByRole('button', { name: mockTags[0].name }));
            expect(mockSetTagFilter).toHaveBeenCalledWith([mockTags[0].id]);
        });

        it('should remove tag from filter when selected tag is clicked', async () => {
            const user = userEvent.setup();

            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    tags: mockTags,
                    tagFilter: [mockTags[0].id],
                    setTagFilter: mockSetTagFilter,
                };
                return selector(state as any);
            });

            render(<TagFilter />);
            await user.click(screen.getByRole('button', { name: new RegExp(mockTags[0].name) }));
            expect(mockSetTagFilter).toHaveBeenCalledWith([]);
        });

        it('should add multiple tags to filter', async () => {
            const user = userEvent.setup();
            let currentFilter: string[] = [];

            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    tags: mockTags,
                    tagFilter: currentFilter,
                    setTagFilter: (newFilter: string[]) => {
                        currentFilter = newFilter;
                        mockSetTagFilter(newFilter);
                    },
                };
                return selector(state as any);
            });

            const { rerender } = render(<TagFilter />);

            await user.click(screen.getByRole('button', { name: mockTags[0].name }));
            expect(mockSetTagFilter).toHaveBeenLastCalledWith([mockTags[0].id]);

            // Update mock to reflect new state
            currentFilter = [mockTags[0].id];
            rerender(<TagFilter />);

            await user.click(screen.getByRole('button', { name: mockTags[1].name }));
            expect(mockSetTagFilter).toHaveBeenLastCalledWith([mockTags[0].id, mockTags[1].id]);
        });
    });

    describe('Active State', () => {
        it('should show X icon on active tags', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    tags: mockTags,
                    tagFilter: [mockTags[0].id],
                    setTagFilter: mockSetTagFilter,
                };
                return selector(state as any);
            });

            render(<TagFilter />);
            // Active tag should have the X icon (additional SVG)
            const activeButton = screen.getByRole('button', { name: new RegExp(mockTags[0].name) });
            expect(activeButton.querySelector('svg')).toBeInTheDocument();
        });

        it('should have ring styling on active tags', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    tags: mockTags,
                    tagFilter: [mockTags[0].id],
                    setTagFilter: mockSetTagFilter,
                };
                return selector(state as any);
            });

            render(<TagFilter />);
            const activeButton = screen.getByRole('button', { name: new RegExp(mockTags[0].name) });
            expect(activeButton).toHaveClass('ring-2');
        });
    });
});
