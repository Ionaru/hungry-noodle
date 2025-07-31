// @ts-check
const eslint = require("@eslint/js");
const typescriptEslint = require("typescript-eslint");
const angularEslint = require("angular-eslint");

module.exports = typescriptEslint.config(
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.mts"],
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.strictTypeChecked,
      ...typescriptEslint.configs.stylisticTypeChecked,
      ...angularEslint.configs.tsRecommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: {
          allowDefaultProject: [],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: __dirname,
      },
    },
    processor: angularEslint.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angularEslint.configs.templateRecommended,
      ...angularEslint.configs.templateAccessibility,
    ],
    rules: {},
  },
);
