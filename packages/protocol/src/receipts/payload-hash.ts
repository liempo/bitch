import { createHash } from "node:crypto";
import canonicalize from "canonicalize";

export function canonicalPayloadHash(payload: unknown): string {
  let canonicalPayload: string | undefined;
  try {
    canonicalPayload = canonicalize(payload);
  } catch (cause) {
    throw new TypeError("The command payload must be valid JSON before hashing.", { cause });
  }
  if (canonicalPayload === undefined) {
    throw new TypeError("The command payload must be valid JSON before hashing.");
  }
  return createHash("sha256").update(canonicalPayload).digest("hex");
}
