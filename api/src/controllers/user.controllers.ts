import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import db from "../models";
import { UUID_PATTERN, sendError } from "../utils/http";
import { hashPassword, verifyPassword } from "../utils/password";

const Users = db.users;

const PASSWORD_MIN_LENGTH = 8;
const CONFLICT_MESSAGE = "Ce login ou cet email est déjà utilisé.";

const trimmed = (value: unknown) => (typeof value === "string" ? value.trim() : value);

// POST /api/users → 201 with the created user (never its password), 400 if invalid,
// 409 if the username or email is already taken
export const create = async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};
  const password: unknown = body.password;

  try {
    const user = Users.build({
      username: body.username,
      firstName: trimmed(body.firstName) as string,
      lastName: trimmed(body.lastName) as string,
      // Lowercase, so that the same address cannot be used twice with different cases
      email: typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email,
      passwordHash: ""
    });

    // Every error at once: the fields checked by the model, then the password, which is not stored as is
    const errors: string[] = [];
    try {
      await user.validate({ skip: ["passwordHash"] });
    } catch (err: unknown) {
      if (!(err instanceof ValidationError)) {
        throw err;
      }
      errors.push(...err.errors.map((e) => e.message));
    }
    if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
    }
    if (errors.length > 0) {
      res.status(400).json({ message: errors.join(" ") });
      return;
    }

    user.passwordHash = await hashPassword(password as string);
    await user.save();
    res.status(201).json(user);
  } catch (err: unknown) {
    sendError(res, err, "Impossible de créer l'utilisateur.", CONFLICT_MESSAGE);
  }
};

// GET /api/users → 200 with every user, sorted by name
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await Users.findAll({
      order: [["lastName", "ASC"], ["firstName", "ASC"]]
    });
    res.status(200).json(users);
  } catch (err: unknown) {
    sendError(res, err, "Impossible de récupérer les utilisateurs.");
  }
};

// DELETE /api/users/:id → 204 without body, or 404
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = UUID_PATTERN.test(id) ? await Users.findByPk(id) : null;
    if (!user) {
      res.status(404).json({ message: "Cet utilisateur n'existe pas." });
      return;
    }
    await user.destroy();
    res.status(204).end();
  } catch (err: unknown) {
    sendError(res, err, "Impossible de supprimer l'utilisateur.");
  }
};

// POST /api/users/login → 200 with the user, or 401.
// Fictitious authentication: the password is checked, but no session or token is created.
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body ?? {};
  try {
    const user =
      typeof username === "string" && typeof password === "string"
        ? await Users.findOne({ where: { username } })
        : null;
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      // Same message in both cases: it must not reveal which usernames exist
      res.status(401).json({ message: "Login ou mot de passe incorrect." });
      return;
    }
    res.status(200).json(user);
  } catch (err: unknown) {
    sendError(res, err, "Impossible de se connecter.");
  }
};

export default { create, getAll, remove, login };
