-- Creates the "users" table used by the API (model: api/src/models/users.model.ts).
-- Run it in pgAdmin: right click on the database > Query Tool.
-- "user" is a reserved word in PostgreSQL, hence the plural name.
--
-- WARNING: drops the existing "users" table and all its rows. The "pollution" table is not touched.

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  -- gen_random_uuid() is built into PostgreSQL 13+; the API generates its own UUIDs as well
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  NOT NULL UNIQUE CHECK (username ~ '^\S+$'),
  first_name    VARCHAR(100) NOT NULL CHECK (btrim(first_name) <> ''),
  last_name     VARCHAR(100) NOT NULL CHECK (btrim(last_name) <> ''),
  -- Stored in lowercase by the API, so that an address cannot be used twice with different cases
  email         VARCHAR(255) NOT NULL UNIQUE,
  -- "salt:hash" computed by the API with scrypt: the password itself is never stored
  password_hash VARCHAR(255) NOT NULL
);
