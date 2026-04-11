import { Button } from '@shared/ui/Button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeDefined();
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Press</Button>);
        await userEvent.click(screen.getByText('Press'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
        const onClick = vi.fn();
        render(
            <Button onClick={onClick} disabled>
                Press
            </Button>,
        );
        await userEvent.click(screen.getByText('Press'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('sets data-variant attribute', () => {
        render(<Button variant='outline'>Outlined</Button>);
        expect(screen.getByText('Outlined').getAttribute('data-variant')).toBe('outline');
    });

    it('defaults to data-variant="default"', () => {
        render(<Button>Default</Button>);
        expect(screen.getByText('Default').getAttribute('data-variant')).toBe('default');
    });
});
