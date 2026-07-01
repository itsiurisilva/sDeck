import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    // This codebase deliberately uses `catch { /* best-effort, ignore */ }`
    // around non-critical cleanup (closing sockets, deleting temp files,
    // etc). That's an intentional pattern here, not an oversight.
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }]
    }
  },
  {
    files: ['server.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node
    }
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, lucide: 'readonly' }
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node
    }
  },
  {
    ignores: ['node_modules/**', 'public/uploads/**', '_backup_old/**']
  }
];
