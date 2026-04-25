import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ComponentProps<'button'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = 'default', size = 'default', asChild = false, ...props },
    ref,
) {
    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            ref={ref}
            data-slot='button'
            data-variant={variant}
            data-size={size}
            className={className}
            {...props}
        />
    );
});

export { Button };
export type { ButtonVariant, ButtonSize };
