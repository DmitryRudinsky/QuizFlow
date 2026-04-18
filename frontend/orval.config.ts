import { defineConfig } from 'orval';

export default defineConfig({
    quizflow: {
        input: { target: 'http://localhost:8080/v3/api-docs' },
        output: {
            mode: 'single',
            target: './src/shared/api/generated/index.ts',
            client: 'fetch',
            clean: true,
            override: {
                mutator: {
                    path: './src/shared/api/client.ts',
                    name: 'customFetch',
                },
            },
        },
    },
});
