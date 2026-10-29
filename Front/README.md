# Projet_Schott_Raphael

## Lancer le projet en local

Depuis le dossier `Front`, après un `npm install` :

```bash
npm start      # application Angular sur http://localhost:4200
```

L'inscription est demandée avant d'accéder au reste de l'application. Il n'y a pas encore de session : l'utilisateur inscrit est oublié au rechargement de la page.

## Conventions

- Le code est en anglais : fichiers, classes, variables, classes CSS, URLs, commentaires et tests.
- Tout ce qui s'affiche à l'écran est en français : textes, libellés, messages d'erreur, titres d'onglet.
- Les types de pollution sont enregistrés sous forme de codes anglais (`illegal-dumping`…) ; leur libellé français est affiché avec le pipe `pollutionTypeLabel`.

## API simulée

En attendant la vraie API, les intercepteurs de `src/app/interceptors/` répondent à sa place. Les services (`UserService`, `PollutionService`) sont écrits comme pour une vraie API, avec l'URL tirée de `src/environments/`.

- **Utilisateurs** : l'intercepteur lit les comptes existants dans `public/mock-api/users.json` et répond à l'inscription : utilisateur créé, ou erreur 409 si le login ou l'email est déjà pris (`adupont`, `bmartin`…).
- **Pollutions** : le jeu de départ est lu dans `public/mock-api/pollutions.json`. Sans serveur, le navigateur ne peut pas écrire dans un fichier : les pollutions enregistrées sont conservées dans le `localStorage` (clé `mock-api.pollutions`). Supprimer cette clé remet les données de départ.

Routes simulées pour les pollutions (préfixées par `apiUrl`) :

| Requête | Corps envoyé | Réponse |
|---|---|---|
| `GET /pollutions` | — | 200 + liste des pollutions |
| `GET /pollutions/:id` | — | 200 + la pollution, ou 404 |
| `POST /pollutions` | `NewPollution` | 201 + la pollution créée (avec son `id`) |
| `PUT /pollutions/:id` | pollution complète | 200 + la pollution modifiée, ou 404 |
| `DELETE /pollutions/:id` | — | 204 sans contenu, ou 404 |

Les fichiers de `public/` sont téléchargeables par tous : ils ne doivent contenir aucun mot de passe. Quand l'API sera déployée, il suffira de renseigner son URL et de passer `mockApi` à `false` dans les fichiers d'environnement.
