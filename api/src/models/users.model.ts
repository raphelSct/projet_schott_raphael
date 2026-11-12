import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

// Same fields as the front's User model, plus the password hash, which never leaves the API.
// The table itself (api/sql/create-table-users.sql) uses snake_case columns.
export interface UserAttributes {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

// Validation messages are in French: the front may display them
const required = (msg: string) => ({ notNull: { msg }, notEmpty: { msg } });

export default function defineUsers(sequelize: Sequelize): UserModel {
  const Users = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          ...required("Le login est requis."),
          is: { args: /^\S+$/, msg: "Le login ne doit pas contenir d'espace." }
        }
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: required("Le prénom est requis.")
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: required("Le nom est requis.")
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          ...required("L'email est requis."),
          isEmail: { msg: "Le format de l'email est invalide." }
        }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    },
    {
      // "user" is a reserved word in PostgreSQL
      tableName: "users",
      freezeTableName: true,
      // firstName ↔ first_name, passwordHash ↔ password_hash…
      underscored: true,
      timestamps: false
    }
  );

  // The password hash is never sent in a response
  Users.prototype.toJSON = function (this: UserInstance) {
    const values: Partial<UserAttributes> = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  return Users;
}
