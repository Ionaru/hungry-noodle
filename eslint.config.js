// @ts-check
const eslint = require("@eslint/js");
const typescriptEslint = require("typescript-eslint");
const angularEslint = require("angular-eslint");

const eslintConfigPrettier = require("eslint-config-prettier");
const eslintConfigUnicorn = require("eslint-plugin-unicorn");
const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginSonarJS = require("eslint-plugin-sonarjs");

module.exports = typescriptEslint.config(
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.mts"],
    extends: [
      eslint.configs.recommended,
      eslintPluginImport.flatConfigs.recommended,
      eslintPluginImport.flatConfigs.typescript,
      ...typescriptEslint.configs.strictTypeChecked,
      ...typescriptEslint.configs.stylisticTypeChecked,
      ...angularEslint.configs.tsRecommended,
      eslintPluginSonarJS.configs.recommended,
      eslintConfigUnicorn.default.configs.recommended,
      eslintConfigPrettier,
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
      "@typescript-eslint/no-extraneous-class": "off",
      "sonarjs/todo-tag": "off",
      "import/no-unresolved": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-top-level-await": "off",
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
            orderImportKind: "asc",
          },
          "newlines-between": "always",
        },
      ],
      "@typescript-eslint/dot-notation": [
        "error",
        {
          allowIndexSignaturePropertyAccess: true,
        },
      ],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "unicorn/consistent-function-scoping": "off",
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
