-- Adds the "severity_index" column to an existing "pollution" table, WITHOUT losing its rows
-- (model: api/src/models/pollutions.model.ts). Run it in pgAdmin: right click on the database > Query Tool.
-- Use create-table-pollution.sql instead for a brand new database (it drops the table and its rows).
--
-- The existing pollutions get the index 0 (level "Faible"): edit them in the application to set the real one.
-- The script can be run again without harm: the column is only added once.

ALTER TABLE pollution
  ADD COLUMN IF NOT EXISTS severity_index INTEGER NOT NULL DEFAULT 0
  CHECK (severity_index BETWEEN 0 AND 1000);

-- The default value was only there to fill the existing rows: from now on, the index must always be given
ALTER TABLE pollution ALTER COLUMN severity_index DROP DEFAULT;

-- Demo pollutions of create-table-pollution.sql: same indexes as in that script. They are matched on their title,
-- and only if their index is still 0, so that an index already set is kept.
UPDATE pollution SET severity_index = 65  WHERE severity_index = 0 AND title = 'Décharge sauvage au bord de la Seine';
UPDATE pollution SET severity_index = 30  WHERE severity_index = 0 AND title = 'Mousse suspecte sur le canal';
UPDATE pollution SET severity_index = 15  WHERE severity_index = 0 AND title = 'Bouteilles plastiques sur la plage';
UPDATE pollution SET severity_index = 120 WHERE severity_index = 0 AND title = 'Odeur de solvant près de la zone industrielle';
UPDATE pollution SET severity_index = 85  WHERE severity_index = 0 AND title = 'Fumées noires d''un brûlage de déchets';
