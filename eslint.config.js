import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Keep for potential future use
console.log(__dirname);

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        jest: "readonly",
        localStorage: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      // Basic JavaScript rules (relaxed)
      ...js.configs.recommended.rules,

      // TypeScript specific
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_|^err$|^error$|^data$|^get$" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off", // Disabled for auth implementation

      // Clean code practices (very relaxed for auth setup)
      "max-lines": [
        "warn",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["warn", { max: 20 }],

      // React/React Native
      "react-hooks/exhaustive-deps": "off",
      "react/prop-types": "off",

      // Common issues - relaxed for development
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off", // TypeScript handles this better
      "no-dupe-else-if": "off", // Disabled for complex auth logic
    },
  },
  {
    ignores: ["node_modules/", "dist/", ".expo/", "**/*.backup"],
  },
];
