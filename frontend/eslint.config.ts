import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['dist', 'node_modules', 'scripts'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: {
            js,
            prettier: pluginPrettier,
            react: pluginReact,
            'react-hooks': pluginReactHooks,
            'react-refresh': pluginReactRefresh,
            'simple-import-sort': simpleImportSort,
        },
        extends: ['js/recommended'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    {
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'react/prop-types': 'off',
            'prettier/prettier': 'error',
            'object-curly-spacing': ['error', 'always'],
            'simple-import-sort/imports': 'error',
            quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
            'jsx-quotes': ['error', 'prefer-single'],
            'max-len': [
                'error',
                {
                    code: 100,
                    tabWidth: 4,
                    ignoreImports: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                    ignoreComments: false,
                },
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    eslintConfigPrettier,
    {
        rules: {
            curly: ['error', 'all'],
            'brace-style': ['error', '1tbs', { allowSingleLine: false }],
        },
    },
]);
