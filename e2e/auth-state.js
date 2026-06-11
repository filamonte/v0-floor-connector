const fs = require("node:fs");
const path = require("node:path");

const preferredContractorStorageState = ".playwright/.auth/contractor.json";
const legacyContractorStorageState = "playwright/.auth/local-user.json";

function loadRootEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envText = fs.readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function resolveContractorStorageStatePath() {
  if (process.env.PLAYWRIGHT_STORAGE_STATE) {
    return path.resolve(process.env.PLAYWRIGHT_STORAGE_STATE);
  }

  const preferredPath = path.resolve(preferredContractorStorageState);
  if (fs.existsSync(preferredPath)) {
    return preferredPath;
  }

  const legacyPath = path.resolve(legacyContractorStorageState);
  if (fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return preferredPath;
}

function hasContractorStorageState() {
  return fs.existsSync(resolveContractorStorageStatePath());
}

function hasContractorCredentials() {
  return Boolean(
    process.env.FLOORCONNECTOR_E2E_EMAIL &&
    process.env.FLOORCONNECTOR_E2E_PASSWORD
  );
}

function canUseOrCreateContractorStorageState() {
  return hasContractorStorageState() || hasContractorCredentials();
}

module.exports = {
  canUseOrCreateContractorStorageState,
  hasContractorCredentials,
  hasContractorStorageState,
  loadRootEnv,
  preferredContractorStorageState,
  resolveContractorStorageStatePath
};
