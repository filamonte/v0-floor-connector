import { z } from "zod";

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export const optionalString = z.preprocess(
  emptyStringToUndefined,
  z.string().min(1).optional()
);

export const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional()
);

export const optionalEnum = <T extends readonly [string, ...string[]]>(
  values: T
) => z.preprocess(emptyStringToUndefined, z.enum(values).optional());
