import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  // Optional CommonJS browser checks run with a Playwright from outside the project.
  { files: ["scripts/e2e/**/*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
];

export default config;
