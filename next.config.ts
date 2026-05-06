import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Project directory (never use a parent folder — stray lockfiles there break Turbopack). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const requireFromConfig = createRequire(import.meta.url);

/** Absolute package root — keeps `@import "tailwindcss"` working when `turbopack.root` is set. */
function npmPackageRoot(packageName: string): string {
  return path.dirname(requireFromConfig.resolve(`${packageName}/package.json`));
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: npmPackageRoot("tailwindcss"),
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
