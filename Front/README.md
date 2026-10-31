# Projet_Schott_Raphael

## Lancer le projet en local

Le front appelle l'API du dossier `api` : lancer d'abord l'API (voir `api/README.md`), puis, depuis le dossier `Front`, après un `npm install` :

```bash
npm start      # application Angular sur http://localhost:4200
```

Il faut se connecter (ou s'inscrire) avant d'accéder au reste de l'application. Il n'y a pas de session : l'utilisateur est oublié au rechargement de la page, il suffit alors de se reconnecter.

## API

L'URL de l'API est définie dans `src/environments/` :

- `environment.development.ts` (`ng serve`) : `http://localhost:3000/api`, l'API lancée en local ;
- `environment.ts` (`ng build`, déployé sur Render) : l'API déployée sur Render.

Les services encapsulent les appels HTTP :

| Service | Méthode | Requête |
|---|---|---|
| `PollutionService` | `getAll()` | `GET /pollutions` |
| | `getOne(id)` | `GET /pollutions/:id` |
| | `create(pollution)` | `POST /pollutions` |
| | `update(pollution, id)` | `PUT /pollutions/:id` |
| | `delete(id)` | `DELETE /pollutions/:id` |
| `UserService` | `signUp(user)` | `POST /users` |
| | `getAll()` | `GET /users` |
| | `delete(id)` | `DELETE /users/:id` |
| | `login(credentials)` | `POST /users/login` (authentification fictive : sans session ni jeton) |

## Pages

- `/login`, `/signup` : connexion et inscription ;
- `/pollutions` : liste filtrable, `/pollutions/new` : déclaration, `/pollutions/:id` : détail, `/pollutions/:id/edit` : modification ;
- `/users` : utilisateurs inscrits, avec suppression (sauf son propre compte).

## Conventions

- Le code est en anglais : fichiers, classes, variables, classes CSS, URLs, commentaires et tests.
- Tout ce qui s'affiche à l'écran est en français : textes, libellés, messages d'erreur, titres d'onglet.
- Les types de pollution sont enregistrés sous forme de codes anglais (`illegal-dumping`…) ; leur libellé français est affiché avec le pipe `pollutionTypeLabel`.
