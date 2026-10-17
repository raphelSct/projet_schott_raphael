import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NouvelUtilisateur } from '../../models/utilisateur';

const nonVide = Validators.pattern(/\S/);

// Validateur de groupe : il a besoin des deux champs pour les comparer
function motsDePasseIdentiques(groupe: AbstractControl): ValidationErrors | null {
  const { motDePasse, confirmation } = groupe.value;
  return confirmation && motDePasse !== confirmation ? { motsDePasseDifferents: true } : null;
}

@Component({
  selector: 'app-formulaire-inscription',
  imports: [ReactiveFormsModule],
  templateUrl: './formulaire-inscription.html',
  styleUrl: './formulaire-inscription.scss',
})
export class FormulaireInscription {
  // Bloque le bouton pendant l'appel à l'API, géré par le composant parent
  @Input() envoiEnCours = false;
  @Output() inscription = new EventEmitter<NouvelUtilisateur>();

  formulaire = new FormGroup(
    {
      prenom: new FormControl('', { nonNullable: true, validators: [Validators.required, nonVide] }),
      nom: new FormControl('', { nonNullable: true, validators: [Validators.required, nonVide] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      login: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\S+$/)] }),
      motDePasse: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: motsDePasseIdentiques },
  );

  envoyer(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    const valeurs = this.formulaire.getRawValue();

    // La confirmation ne sert qu'à la saisie : elle n'est pas envoyée à l'API
    this.inscription.emit({
      login: valeurs.login,
      motDePasse: valeurs.motDePasse,
      nom: valeurs.nom.trim(),
      prenom: valeurs.prenom.trim(),
      email: valeurs.email,
    });
  }
}
