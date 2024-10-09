import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ["**/node_modules/", ".git/", "**/dist/", ".yarn/"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    "plugins": {
      "prettier": {
      },
    },
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
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // note you must disable the base rule
      // as it can report incorrect errors
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error"
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
