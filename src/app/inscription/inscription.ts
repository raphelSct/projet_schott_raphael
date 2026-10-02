import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

export interface Utilisateur {
  login: string;
  motDePasse: string;
  confirmation: string;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-inscription',
  imports: [FormsModule],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  utilisateur: Utilisateur = this.utilisateurVide();

  // Données affichées après une soumission réussie
  utilisateurEnregistre: Utilisateur | null = null;

  motsDePasseIdentiques(): boolean {
    return this.utilisateur.motDePasse === this.utilisateur.confirmation;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.motsDePasseIdentiques()) {
      form.control.markAllAsTouched();
      return;
    }
    this.utilisateurEnregistre = { ...this.utilisateur };
  }

  reinitialiser(form: NgForm): void {
    form.resetForm(this.utilisateurVide());
    this.utilisateurEnregistre = null;
  }

  private utilisateurVide(): Utilisateur {
    return { login: '', motDePasse: '', confirmation: '', nom: '', prenom: '', email: '' };
  }
}
