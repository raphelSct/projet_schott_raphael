import { Component } from '@angular/core';
import { Pollution } from '../models/pollution';
import { FormulairePollution } from './formulaire-pollution/formulaire-pollution';
import { RecapDeclaration } from './recap-declaration/recap-declaration';

@Component({
  selector: 'app-declaration-pollution',
  imports: [FormulairePollution, RecapDeclaration],
  templateUrl: './declaration-pollution.html',
  styleUrl: './declaration-pollution.scss',
})
export class DeclarationPollution {

  submitted:boolean=false;
  // Gardée après le retour au formulaire pour le pré-remplir
  declarationPollution: Pollution | null = null;

  afficherRecap(pollution: Pollution): void {
    this.declarationPollution = pollution;
    this.submitted = true;
  }

  backToForm(): void {
    this.submitted = false;
  }
}
