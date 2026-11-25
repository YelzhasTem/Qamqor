// Module resolution hooks so plain Node can import the app's TypeScript
// modules (src/**/*.ts) the way Next.js does: "@/..." maps to src/, and
// extensionless imports resolve to .ts or .tsx. Node strips the types itself.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const srcRoot = new URL("../../src/", import.meta.url);
const candidates = ["", ".ts", ".tsx", "/index.ts"];

function findFile(baseUrl) {
  for (const suffix of candidates) {
    const url = new URL(baseUrl.href + suffix);
    const path = fileURLToPath(url);
    if (existsSync(path) && statSync(path).isFile()) return url;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let base = null;
  if (specifier.startsWith("@/")) base = new URL(specifier.slice(2), srcRoot);
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.includes("/src/")) {
    base = new URL(specifier, context.parentURL);
  }
  if (base) {
    const url = findFile(base);
    if (url) {
      const isTs = url.pathname.endsWith(".ts") || url.pathname.endsWith(".tsx");
      return { url: url.href, format: isTs ? "module-typescript" : undefined, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}

