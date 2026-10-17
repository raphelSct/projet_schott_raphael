# Projet_Schott_Raphael

## Lancer le projet en local

Depuis le dossier `Front`, après un `npm install` :

```bash
npm start      # application Angular sur http://localhost:4200
```

L'inscription est demandée avant d'accéder au reste de l'application. Il n'y a pas encore de session : l'utilisateur inscrit est oublié au rechargement de la page.

## API simulée

En attendant la vraie API, l'intercepteur `src/app/interceptors/api-simulee.interceptor.ts` répond à sa place :

- les appels sont écrits comme pour une vraie API (`UtilisateurService`, URL tirée de `src/environments/`) ;
- l'intercepteur lit les comptes existants dans `public/mock-api/utilisateurs.json` et construit la réponse : utilisateur créé, ou erreur 409 si le login ou l'email est déjà pris (`adupont`, `bmartin`…).

Le fichier est servi publiquement : il ne doit contenir aucun mot de passe. Quand l'API sera déployée, il suffira de renseigner son URL et de passer `apiSimulee` à `false` dans les fichiers d'environnement.
