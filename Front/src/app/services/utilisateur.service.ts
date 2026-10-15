import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NouvelUtilisateur, Utilisateur } from '../models/utilisateur';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/utilisateurs`;

  // Utilisateur inscrit pendant cette visite. Pas encore de session : il est perdu au rechargement de la page
  private readonly utilisateurInscrit = signal<Utilisateur | null>(null);
  readonly utilisateur = this.utilisateurInscrit.asReadonly();

  inscrire(utilisateur: NouvelUtilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.url, utilisateur).pipe(
      tap((inscrit) => this.utilisateurInscrit.set(inscrit)),
      catchError((erreur: HttpErrorResponse) => throwError(() => new Error(messageErreur(erreur)))),
    );
  }
}

// Traduit l'erreur HTTP en message affichable : les composants n'ont pas à connaître les codes HTTP
function messageErreur(erreur: HttpErrorResponse): string {
  if (erreur.status === 0) {
    return "Impossible de joindre l'API. Vérifiez qu'elle est bien démarrée.";
  }
  if (erreur.status === 409) {
    return 'Ce login ou cet email est déjà utilisé.';
  }
  return `L'inscription a échoué (erreur ${erreur.status}). Réessayez plus tard.`;
}
