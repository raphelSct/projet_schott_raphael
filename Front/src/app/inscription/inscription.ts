import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { NouvelUtilisateur } from '../models/utilisateur';
import { UtilisateurService } from '../services/utilisateur.service';
import { FormulaireInscription } from './formulaire-inscription/formulaire-inscription';

@Component({
  selector: 'app-inscription',
  imports: [FormulaireInscription],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly router = inject(Router);

  // Signaux plutôt que simples propriétés : la réponse HTTP arrive hors d'un événement du template,
  // et l'application (sans zone.js) ne se rafraîchit que si un signal lu par le template change
  readonly envoiEnCours = signal(false);
  readonly erreur = signal<string | null>(null);

  inscrire(utilisateur: NouvelUtilisateur): void {
    this.envoiEnCours.set(true);
    this.erreur.set(null);

    this.utilisateurService
      .inscrire(utilisateur)
      .pipe(finalize(() => this.envoiEnCours.set(false)))
      .subscribe({
        // Le service garde l'utilisateur inscrit : on peut entrer dans l'application
        next: () => this.router.navigate(['/declaration']),
        error: (erreur: Error) => this.erreur.set(erreur.message),
      });
  }
}
