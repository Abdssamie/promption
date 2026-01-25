/**
 * SearchBar Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../tests/test-utils';
import { SearchBar } from './SearchBar';
import { useAppStore } from '../store/appStore';

// Mock the store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

describe('SearchBar', () => {
    const mockSetSearch = vi.fn();

    beforeEach(() => {
        vi.mocked(useAppStore).mockImplementation((selector) => {
            const state = {
                searchQuery: '',
                setSearch: mockSetSearch,
            };
            return selector(state as any);
        });
        mockSetSearch.mockClear();
    });

    describe('Rendering', () => {
        it('should render the search input', () => {
            render(<SearchBar />);
            expect(
                screen.getByPlaceholderText(/search prompts, skills, rules/i)
            ).toBeInTheDocument();
        });

        it('should render the search icon', () => {
            const { container } = render(<SearchBar />);
            // Lucide icons render as SVG
            expect(container.querySelector('svg')).toBeInTheDocument();
        });

        it('should not show clear button when search is empty', () => {
            render(<SearchBar />);
            // There should only be one SVG (search icon)
            const { container } = render(<SearchBar />);
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBe(0);
        });
    });

    describe('User Interactions', () => {
        it('should call setSearch when user types', async () => {
            const user = userEvent.setup();
            render(<SearchBar />);

            const input = screen.getByPlaceholderText(/search prompts, skills, rules/i);
            await user.type(input, 'test query');

            expect(mockSetSearch).toHaveBeenCalled();
        });

        it('should update input value as user types', async () => {
            const user = userEvent.setup();

            // Re-mock to track the value changes
            let currentValue = '';
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    searchQuery: currentValue,
                    setSearch: (val: string) => {
                        currentValue = val;
                        mockSetSearch(val);
                    },
                };
                return selector(state as any);
            });

            render(<SearchBar />);
            const input = screen.getByPlaceholderText(/search prompts, skills, rules/i);
            await user.type(input, 'a');

            expect(mockSetSearch).toHaveBeenCalledWith('a');
        });
    });

    describe('Clear Functionality', () => {
        it('should show clear button when search has value', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    searchQuery: 'test',
                    setSearch: mockSetSearch,
                };
                return selector(state as any);
            });

            const { container } = render(<SearchBar />);
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });

        it('should clear search when clear button is clicked', async () => {
            const user = userEvent.setup();

            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    searchQuery: 'test query',
                    setSearch: mockSetSearch,
                };
                return selector(state as any);
            });

            const { container } = render(<SearchBar />);
            const clearButton = container.querySelector('button');
            expect(clearButton).toBeInTheDocument();

            await user.click(clearButton!);
            expect(mockSetSearch).toHaveBeenCalledWith('');
        });
    });
});
