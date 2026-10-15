// Données envoyées à l'API pour créer un compte
export interface NouvelUtilisateur {
  login: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  email: string;
}

// Utilisateur renvoyé par l'API : elle lui attribue un identifiant,
// et l'application n'a pas à manipuler son mot de passe
export interface Utilisateur extends Omit<NouvelUtilisateur, 'motDePasse'> {
  id: string;
}
