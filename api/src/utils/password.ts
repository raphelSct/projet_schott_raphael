import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// scrypt is built into Node.js: a slow hash with a random salt, so that a stolen
// table does not reveal the passwords. Only "salt:hash" is stored, never the password itself.
const scrypt = promisify(scryptCallback) as (password: string, salt: string, length: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }
  const candidate = await scrypt(password, salt, KEY_LENGTH);
  // Constant-time comparison: the response time does not reveal how many characters match
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
