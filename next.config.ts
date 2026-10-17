import type { NextConfig } from "next";

// Static export: Cloudflare Pages serves out/ as plain files. The API lives in server/ on Render.
const config: NextConfig = { output: "export" };

export default config;
