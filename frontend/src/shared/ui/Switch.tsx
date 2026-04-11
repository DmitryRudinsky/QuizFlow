import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root data-slot='switch' className={className} {...props}>
            <SwitchPrimitive.Thumb data-slot='switch-thumb' />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
