import type { NextConfig } from "next";

// Static export deployed to GitHub Pages at /lazybeastmaster/ (project page,
// not a custom domain) - basePath only applies in the GH Actions build so
// local dev/`next build` elsewhere still serves from the root.
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? "/lazybeastmaster" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
