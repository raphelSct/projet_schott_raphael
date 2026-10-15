import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Pollution } from '../../models/pollution';

const nonVide = Validators.pattern(/\S/);

function dateObservationValide(control: AbstractControl<string | null>): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const date = new Date(control.value + 'T00:00');
  if (isNaN(date.getTime())) {
    return { dateInvalide: true };
  }
  const finDeJournee = new Date();
  finDeJournee.setHours(23, 59, 59, 999);
  return date > finDeJournee ? { dateFuture: true } : null;
}

@Component({
  selector: 'app-formulaire-pollution',
  imports: [ReactiveFormsModule],
  templateUrl: './formulaire-pollution.html',
  styleUrl: './formulaire-pollution.scss',
})
export class FormulairePollution implements OnInit {

  // Déclaration à réafficher quand on revient du récap pour la modifier
  @Input() valeurInitiale: Pollution | null = null;
  @Output() pollutionDeclaree = new EventEmitter<Pollution>();

  readonly typesPollution = ['Plastique', 'Chimique', 'Dépôt sauvage', 'Eau', 'Air', 'Autre'];

  formulaire = new FormGroup({
    titre: new FormControl('',{validators:[Validators.required, nonVide]}),
    type: new FormControl('',{validators:[Validators.required]}),
    description: new FormControl('',{validators:[Validators.required, nonVide]}),
    dateObservation: new FormControl('',{validators:[Validators.required, dateObservationValide]}),
    lieu: new FormControl('',{validators:[Validators.required, nonVide]}),
    latitude: new FormControl<number | null>(null,{validators:[Validators.required,Validators.min(-90),Validators.max(90)]}),
    longitude: new FormControl<number | null>(null,{validators:[Validators.required,Validators.min(-180),Validators.max(180)]}),
    photoUrl: new FormControl('',{validators:[Validators.pattern(/^\s*(https?:\/\/\S+\s*)?$/)]}),
  });

  ngOnInit(): void {
    if (this.valeurInitiale) {
      this.formulaire.setValue({ ...this.valeurInitiale, photoUrl: this.valeurInitiale.photoUrl ?? '' });
    }
  }

  declarer(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.pollutionDeclaree.emit(this.normalize(this.formulaire));
  }

  normalize(formulaire:FormGroup): Pollution{
    let formValue=formulaire.getRawValue();
    const photoUrl = formValue.photoUrl?.trim();

    return {
      titre: formValue.titre.trim(),
      type: formValue.type,
      description: formValue.description.trim(),
      dateObservation: formValue.dateObservation,
      lieu: formValue.lieu.trim(),
      latitude: Number(formValue.latitude),
      longitude: Number(formValue.longitude),
      photoUrl: photoUrl || undefined,
    };
  }
}
