import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Build output and vendored code are never ours to lint.
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Config files at the root are plain CommonJS/ESM node scripts, not app
  // code: tailwind.config.js legitimately require()s its plugins.
  {
    files: ["*.js", "*.cjs", "*.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // An unused argument or a deliberately discarded binding is written with a
  // leading underscore; that is a statement of intent, not an oversight.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Must stay last: turns off every rule that would fight Prettier.
  prettier,
];

export default eslintConfig;
