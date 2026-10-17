import { Component, ElementRef, Input, inject } from '@angular/core';
import { Utilisateur } from '../models/utilisateur';

@Component({
  selector: 'app-profil-utilisateur',
  templateUrl: './profil-utilisateur.html',
  styleUrl: './profil-utilisateur.scss',
  host: {
    '(document:click)': 'fermerSiClicExterieur($event)',
    '(document:keydown.escape)': 'ouvert = false',
  },
})
export class ProfilUtilisateur {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input({ required: true }) utilisateur!: Utilisateur;

  // Ouvert au clic plutôt qu'au survol : le survol n'existe ni sur mobile ni au clavier
  ouvert = false;

  get initiales(): string {
    return (this.utilisateur.prenom.charAt(0) + this.utilisateur.nom.charAt(0)).toUpperCase();
  }

  basculer(): void {
    this.ouvert = !this.ouvert;
  }

  fermerSiClicExterieur(evenement: MouseEvent): void {
    if (!this.element.nativeElement.contains(evenement.target as Node)) {
      this.ouvert = false;
    }
  }
}
