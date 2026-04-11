import { Toaster } from '@shared/ui/Sonner';
import { RouterProvider } from 'react-router';

import { StoreProvider } from './providers/StoreProvider';
import { router } from './routes';

export default function App() {
    return (
        <StoreProvider>
            <RouterProvider router={router} />
            <Toaster />
        </StoreProvider>
    );
}
