# API Pollution

API Node.js / Express / Sequelize connectée à la base PostgreSQL `pollution-db` créée par le blueprint Render (`render.yaml` à la racine du dépôt). Elle expose le CRUD des pollutions utilisé par le front.

## Configuration

Aucun identifiant n'est écrit dans le code : l'API lit l'URL de connexion dans la variable d'environnement `DATABASE_URL`.

- **Sur Render** : rien à faire, le blueprint fournit `DATABASE_URL` (URL *interne* de la base) au service `pollution-api`.
- **En local** : copier `.env.example` en `.env` et y coller l'URL **externe** de la base. Le fichier `.env` est ignoré par git : il ne doit jamais être commité.

L'URL externe se trouve dans le dashboard Render : base `pollution-db` → bouton **Connect** → onglet **External** → *External Database URL*.

## Créer la table

La table est créée par le script [`sql/create-table-pollution.sql`](sql/create-table-pollution.sql), pas par l'API. Dans pgAdmin : clic droit sur la base → **Query Tool**, ouvrir le script, puis l'exécuter (F5).

Le script supprime la table `pollution` existante (y compris l'ancienne version avec les colonnes `ville`, `polluant`, `valeur`), la recrée, puis insère 5 pollutions de démonstration.

Les colonnes sont en snake_case (`observation_date`, `photo_url`) ; Sequelize les convertit vers les champs du front (`observationDate`, `photoUrl`).

## Lancer en local

```bash
npm install
npm run dev
```

Au démarrage, la console doit afficher `Connected to the database.` puis `Server is running…`. Sinon, l'API s'arrête avec la cause :

- `Unable to connect to the database: …` : URL, mot de passe, hôte ou SSL incorrect ;
- `The "pollution" table is not ready (…)` : la table n'existe pas ou n'a pas les bonnes colonnes, il faut exécuter le script SQL.

Pour afficher les requêtes SQL envoyées par Sequelize, ajouter `DB_LOGGING=true` dans le `.env`.

## Routes

Préfixe : `/api/pollutions` (aussi disponible en `/api/pollution`).

| Requête | Corps envoyé | Réponse |
|---|---|---|
| `GET /api/pollutions` | — | 200 + liste, de l'observation la plus récente à la plus ancienne |
| `GET /api/pollutions/:id` | — | 200 + la pollution, ou 404 |
| `POST /api/pollutions` | pollution sans `id` | 201 + la pollution créée (avec son `id`), ou 400 |
| `PUT /api/pollutions/:id` | pollution complète | 200 + la pollution modifiée, 400 ou 404 |
| `DELETE /api/pollutions/:id` | — | 204 sans contenu, ou 404 |

Les données sont validées par l'API (champs requis, type connu, coordonnées, date non future, URL de photo) : une erreur 400 renvoie `{ "message": "…" }` avec les messages en français.

## Se connecter avec pgAdmin

Dans le dashboard Render, ouvrir la base `pollution-db` → **Connect** → onglet **External**, puis dans pgAdmin : clic droit sur *Servers* → **Register** → **Server…**

| Onglet | Champ | Valeur |
|---|---|---|
| General | Name | `Render - pollution-db` (au choix) |
| Connection | Host name/address | le **hostname externe** : `dpg-…-a.oregon-postgres.render.com` |
| Connection | Port | `5432` |
| Connection | Maintenance database | le nom de la base (`pollution_db…`, tel qu'affiché par Render) |
| Connection | Username | l'utilisateur (`pollution_user…`, tel qu'affiché par Render) |
| Connection | Password | le mot de passe affiché par Render |
| Parameters | SSL mode | `require` |

Les deux erreurs les plus fréquentes :

1. **Utiliser le hostname interne** (`dpg-…-a`, sans `.oregon-postgres.render.com`) : il ne fonctionne que depuis les services hébergés sur Render.
2. **Oublier `SSL mode = require`** : Render refuse les connexions externes non chiffrées.

La table se trouve ensuite dans *Databases → (la base) → Schemas → public → Tables → pollution* (clic droit → **View/Edit Data**).

Si la connexion échoue encore, vérifier dans Render que la base est bien disponible (les bases gratuites expirent au bout de 30 jours) et que la rubrique **Access Control** autorise les connexions externes.
