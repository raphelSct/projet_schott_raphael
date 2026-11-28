# Projet_Schott_Raphael

## Lancer le projet en local

Le front appelle l'API du dossier `api` : lancer d'abord l'API (voir `api/README.md`), puis, depuis le dossier `Front`, après un `npm install` :

```bash
npm start      # application Angular sur http://localhost:4200
```

Il faut se connecter (ou s'inscrire) avant d'accéder au reste de l'application. L'utilisateur connecté est conservé au rechargement de la page (voir plus bas).

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
- `/favorites` (ou `/favoris`) : « Mes Favoris » ;
- `/users` : utilisateurs inscrits, avec suppression (sauf son propre compte).

## Authentification : store NGXS

L'utilisateur connecté est dans le state `auth` du store NGXS, seule source de vérité.

| Élément | Fichier | Rôle |
|---|---|---|
| Modèle | `src/app/models/auth.ts` | `AuthStateModel` : `user` (`id`, `email`, `name`, `role`) et `isAuthenticated` |
| Actions | `src/app/store/auth.actions.ts` | `[Auth] Login` (`email`, `name`) et `[Auth] Logout` |
| State | `src/app/store/auth.state.ts` | traite les actions ; sélecteurs `user`, `isAuthenticated`, `username` |
| Configuration | `src/app/app.config.ts` | `provideStore([AuthState])` et `withNgxsStoragePlugin({ keys: ['auth'] })` |

Cycle : un composant fait `dispatch` d'une action, le state se met à jour, les composants et les guards le relisent avec les sélecteurs (`selectSignal`, `selectSnapshot`). `Login` est dispatchée par les pages de connexion et d'inscription **après** la réponse de l'API (qui vérifie le mot de passe), `Logout` par le bouton « Se déconnecter ».

Le plugin de stockage enregistre le state dans le `localStorage` (clé `auth`) et le relit au démarrage : on reste connecté après un rechargement (F5).

C'est une authentification **simulée** : `id` et `role` sont fictifs, il n'y a pas de jeton, et le contenu du `localStorage` peut être modifié à la main. Les guards guident la navigation mais ne protègent pas les données ; ce sera le rôle du jeton (JWT) vérifié par l'API.

## Favoris : second state NGXS

Le dossier `src/app/core/states/favorites/` contient les actions et le state `favorites` (`items: Pollution[]`), lui aussi enregistré dans le `localStorage` (clé `favorites`) : les favoris survivent au rechargement et à la fermeture du navigateur.

| Action | Effet |
|---|---|
| `AddFavorite(pollution)` | ajoute la pollution, sans jamais dupliquer un id |
| `RemoveFavorite(pollutionId)` | retire la pollution (aussi déclenchée quand on supprime une pollution) |
| `ToggleFavorite(pollution)` | ajoute ou retire : c'est l'étoile ☆ / ★ des cartes et de la page de détail |
| `ClearFavorites` | vide la liste (bouton « Vider tous mes favoris », avec confirmation) |
| `SyncFavorites(pollutions)` | remplace les copies par les valeurs actuelles de l'API et retire les pollutions disparues ; déclenchée à l'ouverture de « Mes Favoris » |

Sélecteurs : `items`, `countFavorites` (badge de l'en-tête) et `isFavorite` (étoile). Le state n'est jamais modifié sur place : chaque action produit un nouveau tableau.

Les favoris sont ceux du **navigateur**, pas du compte : le modèle ne mémorise pas à qui ils appartiennent, et ils restent après une déconnexion.

## Navigation : guards et chargement à la demande

Chaque page est chargée à la demande (`loadComponent` et `loadChildren` dans `src/app/app.routes.ts` et `src/app/pollutions/pollutions.routes.ts`) : son code n'est téléchargé qu'à la première visite. Le bundle initial est passé d'environ 396 ko à 302 ko.

| Guard (`src/app/guards/`) | Type | Rôle |
|---|---|---|
| `authGuard` | `canMatch` | réserve `/pollutions`, `/favorites` et `/users` aux utilisateurs connectés (lus dans le store). Un visiteur est envoyé sur `/login?returnUrl=…` : la page demandée est mémorisée et la connexion y ramène. `canMatch` plutôt que `canActivate`, pour que le code de la page ne soit même pas téléchargé |
| `guestGuard` | `canMatch` | renvoie sur `/pollutions` un utilisateur déjà connecté qui arrive sur `/login` ou `/signup` (bouton Précédent du navigateur, par exemple) |
| `unsavedChangesGuard` | `canDeactivate` | demande confirmation (fenêtre de confirmation de l'application) avant de quitter `/pollutions/new` ou `/pollutions/:id/edit` avec des modifications non enregistrées. Rien n'est demandé après un enregistrement réussi ni après une déconnexion |

Une adresse inconnue redirige vers `/pollutions` (puis vers la connexion si besoin).

## Détection des changements

Tous les composants déclarent `changeDetection: ChangeDetectionStrategy.OnPush` : Angular ne les revérifie que si un de leurs `@Input` change, si un événement de leur template se produit ou si un signal lu par leur template change. C'est aussi le comportement par défaut d'Angular 22, ici rendu explicite. En contrepartie, l'état affiché doit être dans un signal ou un `@Input`, jamais dans un champ ordinaire modifié après une réponse HTTP ou un minuteur.

## Conventions

- Le code est en anglais : fichiers, classes, variables, classes CSS, URLs, commentaires et tests.
- Tout ce qui s'affiche à l'écran est en français : textes, libellés, messages d'erreur, titres d'onglet.
- Les types de pollution sont enregistrés sous forme de codes anglais (`illegal-dumping`…) ; leur libellé français est affiché avec le pipe `pollutionTypeLabel`.
