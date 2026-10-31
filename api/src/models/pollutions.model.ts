import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

// Same codes as the front (front/src/app/models/pollution.ts), which shows their French labels
export const POLLUTION_TYPES = ["plastic", "chemical", "illegal-dumping", "water", "air", "other"] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

// Same fields as the front's Pollution model: they are the JSON keys exchanged with it.
// The table itself (api/sql/create-table-pollution.sql) uses snake_case columns.
export interface PollutionAttributes {
  id: string;
  title: string;
  type: PollutionType;
  description: string;
  observationDate: string;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
}

// The id is generated on creation, the photo is optional
export interface PollutionCreationAttributes extends Optional<PollutionAttributes, "id" | "photoUrl"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

// Validation messages are in French: the front may display them
const required = (msg: string) => ({ notNull: { msg }, notEmpty: { msg } });

export default function definePollutions(
  sequelize: Sequelize,
  _seq?: typeof Sequelize
): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: required("Le titre est requis.")
      },
      type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: { msg: "Le type de pollution est requis." },
          isIn: { args: [[...POLLUTION_TYPES]], msg: "Ce type de pollution n'existe pas." }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: required("La description est requise.")
      },
      observationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: { msg: "La date de l'observation est requise." },
          isDate: { args: true, msg: "La date de l'observation n'est pas valide." },
          notInFuture(value: string) {
            // Compared with tomorrow in UTC: the server's date may lag one day behind the user's time zone
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            if (value > tomorrow) {
              throw new Error("La date de l'observation ne peut pas être dans le futur.");
            }
          }
        }
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: required("Le lieu est requis.")
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: { msg: "La latitude est requise." },
          // min/max let a non-numeric value through: isFloat rejects it before PostgreSQL does
          isFloat: { msg: "La latitude doit être un nombre." },
          min: { args: [-90], msg: "La latitude doit être comprise entre -90 et 90." },
          max: { args: [90], msg: "La latitude doit être comprise entre -90 et 90." }
        }
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: { msg: "La longitude est requise." },
          isFloat: { msg: "La longitude doit être un nombre." },
          min: { args: [-180], msg: "La longitude doit être comprise entre -180 et 180." },
          max: { args: [180], msg: "La longitude doit être comprise entre -180 et 180." }
        }
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          is: { args: /^https?:\/\/\S+$/, msg: "L'URL de la photo doit commencer par http:// ou https://." }
        }
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      // observationDate ↔ observation_date, photoUrl ↔ photo_url
      underscored: true,
      timestamps: false
    }
  );

  return Pollutions;
}
