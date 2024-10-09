// @ts-check

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
      "prettier/prettier": [
        "error",
        {
          "tabWidth": 2,
          "useTabs": false,
          "semi": false,
          "singleQuote": true,
          "trailingComma": "all",
          "printWidth": 110
        }
      ]
    }
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
