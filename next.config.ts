import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";
import path from "path";
const nextConfig: NextConfig = {
  turbopack:{
    root: path.join(__dirname, '..'),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
   unoptimized: true,
  },
};
export default  withSerwist(nextConfig)
