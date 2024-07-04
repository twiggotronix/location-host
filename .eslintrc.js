module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended', // Basic ESLint rules
        'plugin:import/errors', // ESLint plugin for import/export syntax
        'plugin:import/warnings', // ESLint plugin for import/export syntax
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    rules: {
        // Customize your rules here
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },
        },
        'prettier.configPath': './.prettierrc',
    },
    globals: {
        process: 'readonly',
        NodeJS: 'readonly',
    },
};
