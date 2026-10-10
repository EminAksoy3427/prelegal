import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Built as static files and served by the FastAPI backend (see ../Dockerfile).
  output: "export",
  // Emits `/nda/index.html` rather than `/nda.html`, which is what the
  // backend's static file server resolves for a request to `/nda`.
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
