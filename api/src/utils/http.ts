import { Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";

// Ids are UUIDs: any other value cannot match a row (and PostgreSQL would reject it)
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 409 when a unique value is already taken, 400 with the validation messages,
// 500 otherwise (details stay in the server logs)
export function sendError(res: Response, err: unknown, message: string, conflictMessage?: string): void {
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ message: conflictMessage ?? "Cette valeur est déjà utilisée." });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.errors.map((e) => e.message).join(" ") });
    return;
  }
  console.error(message, err);
  res.status(500).json({ message });
}
