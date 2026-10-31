-- Creates the "pollution" table used by the API (model: api/src/models/pollutions.model.ts)
-- and fills it with demo data. Run it in pgAdmin: right click on the database > Query Tool.
--
-- WARNING: drops the existing "pollution" table and all its rows,
-- including the previous version of the table (ville / polluant / valeur columns).

DROP TABLE IF EXISTS pollution;

CREATE TABLE pollution (
  -- gen_random_uuid() is built into PostgreSQL 13+; the API generates its own UUIDs as well
  id               UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(255)     NOT NULL CHECK (btrim(title) <> ''),
  -- Codes shared with the front, which shows their French labels
  type             VARCHAR(30)      NOT NULL
                   CHECK (type IN ('plastic', 'chemical', 'illegal-dumping', 'water', 'air', 'other')),
  description      TEXT             NOT NULL CHECK (btrim(description) <> ''),
  observation_date DATE             NOT NULL,
  location         VARCHAR(255)     NOT NULL CHECK (btrim(location) <> ''),
  latitude         DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude        DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  -- Optional; when present, it must be an http(s) URL
  photo_url        TEXT             CHECK (photo_url ~ '^https?://\S+$')
);

-- Demo data: the same pollutions as the front's mock API (front/public/mock-api/pollutions.json)
INSERT INTO pollution (title, type, description, observation_date, location, latitude, longitude, photo_url) VALUES
  ('Décharge sauvage au bord de la Seine', 'illegal-dumping',
   E'Une vingtaine de sacs poubelle et des gravats abandonnés sur la berge.\nRisque de chute dans l''eau en cas de crue.',
   '2026-10-01', 'Quai de la Rapée, Paris 12e', 48.8443, 2.3706, 'https://picsum.photos/id/1043/800/450'),
  ('Mousse suspecte sur le canal', 'water',
   'Mousse blanchâtre à la surface de l''eau sur une cinquantaine de mètres, avec une odeur de lessive.',
   '2026-09-22', 'Canal Saint-Martin, Paris 10e', 48.8721, 2.3658, NULL),
  ('Bouteilles plastiques sur la plage', 'plastic',
   'Nombreuses bouteilles et emballages plastiques ramenés par la marée, surtout près des rochers.',
   '2026-08-14', 'Plage du Prado, Marseille', 43.2593, 5.3756, 'https://picsum.photos/id/1015/800/450'),
  ('Odeur de solvant près de la zone industrielle', 'chemical',
   'Forte odeur de solvant ressentie le matin, accompagnée de picotements aux yeux.',
   '2026-09-30', 'Zone industrielle, Saint-Fons', 45.7068, 4.853, NULL),
  ('Fumées noires d''un brûlage de déchets', 'air',
   'Brûlage de déchets verts et de plastiques dans un jardin, fumée noire visible depuis la rue.',
   '2026-10-05', 'Chemin des Vignes, Bordeaux', 44.851, -0.58, NULL);
