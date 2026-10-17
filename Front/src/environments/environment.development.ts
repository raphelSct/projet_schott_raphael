// Configuration de développement (ng serve) : remplace environment.ts via angular.json
export const environment = {
  // URL de l'API lancée en local, quand elle existera
  apiUrl: 'http://localhost:3000',
  // Réponses de l'API simulées par api-simulee.interceptor.ts
  apiSimulee: true,
};
