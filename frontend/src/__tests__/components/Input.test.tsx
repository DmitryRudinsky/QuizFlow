import { Input } from '@shared/ui/Input';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('Input', () => {
    it('renders with the provided placeholder', () => {
        render(<Input placeholder='Enter text' />);
        expect(screen.getByPlaceholderText('Enter text')).toBeDefined();
    });

    it('fires onChange on user input', async () => {
        const onChange = vi.fn();
        render(<Input onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'hello');
        expect(onChange).toHaveBeenCalled();
    });

    it('sets data-slot="input" attribute', () => {
        render(<Input />);
        const input = document.querySelector('[data-slot="input"]');
        expect(input).not.toBeNull();
    });
});
