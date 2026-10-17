// Configuration de production (ng build)
export const environment = {
  // À remplacer par l'URL de l'API déployée quand elle existera
  apiUrl: '/api',
  // Réponses de l'API simulées par api-simulee.interceptor.ts : à passer à false une fois l'API déployée
  apiSimulee: true,
};
