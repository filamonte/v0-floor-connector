import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@floorconnector/config",
    "@floorconnector/db",
    "@floorconnector/ui"
  ]
};

export default nextConfig;
