import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { filter, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NouvelUtilisateur, Utilisateur } from '../models/utilisateur';

// Comptes déjà existants, servis comme un fichier statique depuis public/
// (sans mot de passe : tout ce qui est dans public/ est téléchargeable)
const FICHIER_UTILISATEURS = 'mock-api/utilisateurs.json';

// Simule l'API tant qu'elle n'existe pas (activé par environment.apiSimulee) :
// l'inscription ne part vers aucun serveur, la réponse est construite ici à partir du fichier JSON
export const apiSimuleeInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || req.url !== `${environment.apiUrl}/utilisateurs`) {
    return next(req);
  }
  const nouvel = req.body as NouvelUtilisateur;

  return next(req.clone({ method: 'GET', url: FICHIER_UTILISATEURS, body: null })).pipe(
    filter((evenement): evenement is HttpResponse<Utilisateur[]> => evenement instanceof HttpResponse),
    switchMap((reponse) => {
      const existants = reponse.body ?? [];
      if (existants.some((u) => u.login === nouvel.login || u.email === nouvel.email)) {
        return throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict', url: req.url }));
      }

      // Comme le ferait l'API : elle attribue un identifiant et ne renvoie pas le mot de passe
      const cree: Utilisateur = {
        id: crypto.randomUUID(),
        login: nouvel.login,
        nom: nouvel.nom,
        prenom: nouvel.prenom,
        email: nouvel.email,
      };
      return of<HttpEvent<Utilisateur>>(new HttpResponse({ status: 201, body: cree, url: req.url }));
    }),
  );
};
