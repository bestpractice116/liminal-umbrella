import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    ...tseslint.configs.recommendedTypeChecked,
  ),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        module: true,
        require: true,
        process: true,
        __dirname: true,
        exports: true,
        global: true,
      }
    },
    "plugins": {
      "prettier": {
      },
    },
    ignores: ["**/node_modules/", ".git/", "**/dist/", ".yarn/"],
    "rules": {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": [
            "parameter",
            "variable"
          ],
          "leadingUnderscore": "require",
          "format": ["camelCase"],
          "modifiers": [
            "unused"
          ]
        },
        {
          "selector": [
            "parameter",
            "variable"
          ],
          "leadingUnderscore": "allowDouble",
          "format": [
            "camelCase"
          ]
        },
        {
          "selector": "variable",
          "modifiers": ["const", "global", "exported"],
          "format": ["UPPER_CASE"]
        }
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      // note you must disable the base rule
      // as it can report incorrect errors
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
    },
  },
  {
    files: ['**/*.js', 'eslint.config.mjs', 'jest.config.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['src/migrations/*.ts'],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    }
];
