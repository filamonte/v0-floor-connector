import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const rootEnvPath = path.resolve(__dirname, "../..", ".env.local");

if (fs.existsSync(rootEnvPath)) {
  const rootEnvFile = fs.readFileSync(rootEnvPath, "utf8");

  for (const rawLine of rootEnvFile.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key) {
      process.env[key] = value;
    }
  }
}

const nextConfig: NextConfig = {
  transpilePackages: [
    "@floorconnector/config",
    "@floorconnector/db",
    "@floorconnector/ui"
  ]
};

export default nextConfig;
