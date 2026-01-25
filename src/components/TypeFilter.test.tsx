/**
 * TypeFilter Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../tests/test-utils';
import { TypeFilter } from './TypeFilter';
import { useAppStore } from '../store/appStore';

// Mock the store
vi.mock('../store/appStore', () => ({
    useAppStore: vi.fn(),
}));

describe('TypeFilter', () => {
    const mockSetTypeFilter = vi.fn();

    beforeEach(() => {
        vi.mocked(useAppStore).mockImplementation((selector) => {
            const state = {
                typeFilter: null,
                setTypeFilter: mockSetTypeFilter,
            };
            return selector(state as any);
        });
        mockSetTypeFilter.mockClear();
    });

    describe('Rendering', () => {
        it('should render all filter options', () => {
            render(<TypeFilter />);

            expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Skills' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Rules' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Workflows' })).toBeInTheDocument();
        });

        it('should highlight "All" when no filter is active', () => {
            render(<TypeFilter />);
            const allButton = screen.getByRole('button', { name: 'All' });
            expect(allButton).toHaveClass('bg-bg-hover');
        });
    });

    describe('User Interactions', () => {
        it('should call setTypeFilter with "skill" when Skills clicked', async () => {
            const user = userEvent.setup();
            render(<TypeFilter />);

            await user.click(screen.getByRole('button', { name: 'Skills' }));
            expect(mockSetTypeFilter).toHaveBeenCalledWith('skill');
        });

        it('should call setTypeFilter with "rule" when Rules clicked', async () => {
            const user = userEvent.setup();
            render(<TypeFilter />);

            await user.click(screen.getByRole('button', { name: 'Rules' }));
            expect(mockSetTypeFilter).toHaveBeenCalledWith('rule');
        });

        it('should call setTypeFilter with "workflow" when Workflows clicked', async () => {
            const user = userEvent.setup();
            render(<TypeFilter />);

            await user.click(screen.getByRole('button', { name: 'Workflows' }));
            expect(mockSetTypeFilter).toHaveBeenCalledWith('workflow');
        });

        it('should call setTypeFilter with null when All clicked', async () => {
            const user = userEvent.setup();
            render(<TypeFilter />);

            await user.click(screen.getByRole('button', { name: 'All' }));
            expect(mockSetTypeFilter).toHaveBeenCalledWith(null);
        });
    });

    describe('Active State', () => {
        it('should highlight Skills button when skill filter is active', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    typeFilter: 'skill',
                    setTypeFilter: mockSetTypeFilter,
                };
                return selector(state as any);
            });

            render(<TypeFilter />);
            const skillsButton = screen.getByRole('button', { name: 'Skills' });
            expect(skillsButton).toHaveClass('bg-bg-hover');
        });

        it('should highlight Rules button when rule filter is active', () => {
            vi.mocked(useAppStore).mockImplementation((selector) => {
                const state = {
                    typeFilter: 'rule',
                    setTypeFilter: mockSetTypeFilter,
                };
                return selector(state as any);
            });

            render(<TypeFilter />);
            const rulesButton = screen.getByRole('button', { name: 'Rules' });
            expect(rulesButton).toHaveClass('bg-bg-hover');
        });
    });
});
