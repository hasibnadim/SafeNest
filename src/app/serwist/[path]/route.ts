import { createSerwistRoute } from "@serwist/turbopack";

export const {
  dynamic,
  dynamicParams,
  revalidate,
  generateStaticParams,
  GET,
} = createSerwistRoute({
  // Resolved relative to the project root, hence the `src/` prefix.
  swSrc: "src/app/sw.ts",
  // The Monaco editor loads these on demand and they are far too large to be
  // worth precaching (the TypeScript worker alone is ~5.8 MB). Excluding them
  // explicitly keeps them out of the precache instead of warning at build time.
  globIgnores: [
    "**/monaco/vs/editor/editor.main.js",
    "**/monaco/vs/language/typescript/tsWorker.js",
  ],
});
