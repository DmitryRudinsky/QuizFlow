import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('src', import.meta.url));

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://localhost:8080',
        },
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
    resolve: {
        alias: {
            '@app': `${root}/app`,
            '@pages': `${root}/pages`,
            '@widgets': `${root}/widgets`,
            '@features': `${root}/features`,
            '@entities': `${root}/entities`,
            '@shared': `${root}/shared`,
        },
    },
});
