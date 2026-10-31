import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import db from "../models";
import { PollutionCreationAttributes, PollutionInstance } from "../models/pollutions.model";

const Pollutions = db.pollutions;

// Ids are UUIDs: any other value cannot match a pollution (and PostgreSQL would reject it)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only the fields the client may set: the id is chosen by the API.
// A missing photo becomes null, so that a PUT without photoUrl removes the photo.
function pollutionFields(body: Record<string, unknown> = {}): PollutionCreationAttributes {
  return {
    title: body.title,
    type: body.type,
    description: body.description,
    observationDate: body.observationDate,
    location: body.location,
    latitude: body.latitude,
    longitude: body.longitude,
    photoUrl: body.photoUrl || null
  } as PollutionCreationAttributes;
}

// Pollution whose id is in the URL, or null once a 404 has been sent
async function findFromParams(req: Request, res: Response): Promise<PollutionInstance | null> {
  const id = String(req.params.id);
  const pollution = UUID_PATTERN.test(id) ? await Pollutions.findByPk(id) : null;
  if (!pollution) {
    res.status(404).json({ message: "Cette pollution n'existe pas." });
  }
  return pollution;
}

// 400 with the validation messages, 500 otherwise (details stay in the server logs)
function sendError(res: Response, err: unknown, message: string): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.errors.map((e) => e.message).join(" ") });
    return;
  }
  console.error(message, err);
  res.status(500).json({ message });
}

// GET /api/pollutions → 200 with every pollution, most recent observation first
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["observationDate", "DESC"], ["title", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Impossible de récupérer les pollutions.");
  }
};

// GET /api/pollutions/:id → 200 with the pollution, or 404
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pollution = await findFromParams(req, res);
    if (pollution) {
      res.status(200).json(pollution);
    }
  } catch (err: unknown) {
    sendError(res, err, "Impossible de récupérer la pollution.");
  }
};

// POST /api/pollutions → 201 with the created pollution, or 400 if the data is invalid
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await Pollutions.create(pollutionFields(req.body));
    res.status(201).json(created);
  } catch (err: unknown) {
    sendError(res, err, "Impossible d'enregistrer la pollution.");
  }
};

// PUT /api/pollutions/:id → 200 with the updated pollution, 400 if the data is invalid, or 404.
// The whole pollution is replaced: the body must contain every field.
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const pollution = await findFromParams(req, res);
    if (pollution) {
      pollution.set(pollutionFields(req.body));
      await pollution.save();
      res.status(200).json(pollution);
    }
  } catch (err: unknown) {
    sendError(res, err, "Impossible de modifier la pollution.");
  }
};

// DELETE /api/pollutions/:id → 204 without body, or 404
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const pollution = await findFromParams(req, res);
    if (pollution) {
      await pollution.destroy();
      res.status(204).end();
    }
  } catch (err: unknown) {
    sendError(res, err, "Impossible de supprimer la pollution.");
  }
};

export default { getAll, getById, create, update, remove };
