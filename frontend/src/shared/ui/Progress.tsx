import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

function Progress({
    className,
    value,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
    return (
        <ProgressPrimitive.Root data-slot='progress' className={className} {...props}>
            <ProgressPrimitive.Indicator
                data-slot='progress-indicator'
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
