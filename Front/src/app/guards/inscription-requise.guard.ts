import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur.service';

// Le reste de l'application n'est accessible qu'une fois l'inscription faite
export const inscriptionRequiseGuard: CanActivateFn = () => {
  const inscrit = inject(UtilisateurService).utilisateur();
  return inscrit ? true : inject(Router).createUrlTree(['/inscription']);
};
