import { randomInt } from "node:crypto";

const upperCase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const lowerCase = "abcdefghijkmnopqrstuvwxyz";
const digits = "23456789";
const symbols = "!@#$%&*?";
const allPasswordCharacters = `${upperCase}${lowerCase}${digits}${symbols}`;

const temporaryCredentialRequiredKey =
  "floorconnectorTemporaryPortalCredentialRequired";
const temporaryCredentialIssuedAtKey =
  "floorconnectorTemporaryPortalCredentialIssuedAt";
const temporaryCredentialOrganizationIdKey =
  "floorconnectorTemporaryPortalCredentialOrganizationId";
const temporaryCredentialCustomerIdKey =
  "floorconnectorTemporaryPortalCredentialCustomerId";
const temporaryCredentialCustomerContactIdKey =
  "floorconnectorTemporaryPortalCredentialCustomerContactId";
const temporaryCredentialGrantIdKey =
  "floorconnectorTemporaryPortalCredentialGrantId";

function pickCharacter(characters: string) {
  return characters[randomInt(0, characters.length)];
}

function shuffleCharacters(characters: string[]) {
  return characters
    .map((character) => ({ character, sort: randomInt(0, 1_000_000) }))
    .sort((left, right) => left.sort - right.sort)
    .map(({ character }) => character)
    .join("");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

export function generateTemporaryPortalPassword(length = 20) {
  const minimumLength = Math.max(length, 18);
  const characters = [
    pickCharacter(upperCase),
    pickCharacter(lowerCase),
    pickCharacter(digits),
    pickCharacter(symbols)
  ];

  while (characters.length < minimumLength) {
    characters.push(pickCharacter(allPasswordCharacters));
  }

  return shuffleCharacters(characters);
}

export function buildTemporaryPortalCredentialAppMetadata(input: {
  existingAppMetadata: unknown;
  organizationId: string;
  customerId: string;
  customerContactId: string | null;
  portalAccessGrantId: string;
  issuedAt: string;
}) {
  return {
    ...asRecord(input.existingAppMetadata),
    [temporaryCredentialRequiredKey]: true,
    [temporaryCredentialIssuedAtKey]: input.issuedAt,
    [temporaryCredentialOrganizationIdKey]: input.organizationId,
    [temporaryCredentialCustomerIdKey]: input.customerId,
    [temporaryCredentialCustomerContactIdKey]: input.customerContactId,
    [temporaryCredentialGrantIdKey]: input.portalAccessGrantId
  };
}

export function clearTemporaryPortalCredentialAppMetadata(existingAppMetadata: unknown) {
  const metadata = asRecord(existingAppMetadata);

  metadata[temporaryCredentialRequiredKey] = false;
  delete metadata[temporaryCredentialIssuedAtKey];
  delete metadata[temporaryCredentialOrganizationIdKey];
  delete metadata[temporaryCredentialCustomerIdKey];
  delete metadata[temporaryCredentialCustomerContactIdKey];
  delete metadata[temporaryCredentialGrantIdKey];

  return metadata;
}

export function shouldRequireTemporaryPortalCredentialChange(user: {
  app_metadata?: unknown;
  user_metadata?: unknown;
}) {
  const appMetadata = asRecord(user.app_metadata);

  return appMetadata[temporaryCredentialRequiredKey] === true;
}
