import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NewPollution, POLLUTION_TYPES } from '../../models/pollution';
import { PollutionTypeLabelPipe } from '../../pipes/pollution-type-label.pipe';

const notBlank = Validators.pattern(/\S/);

function validObservationDate(control: AbstractControl<string | null>): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const date = new Date(control.value + 'T00:00');
  if (isNaN(date.getTime())) {
    return { invalidDate: true };
  }
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return date > endOfToday ? { futureDate: true } : null;
}

@Component({
  selector: 'app-pollution-form',
  imports: [PollutionTypeLabelPipe, ReactiveFormsModule],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.scss',
})
export class PollutionForm implements OnInit {

  // Pollution to prefill the form with (edit page)
  @Input() initialValue: NewPollution | null = null;
  // Texts depending on the page (report or edit)
  @Input() heading = 'Déclarer une pollution';
  @Input() submitLabel = 'Déclarer';
  @Output() pollutionSubmitted = new EventEmitter<NewPollution>();

  readonly pollutionTypes = POLLUTION_TYPES;

  form = new FormGroup({
    title: new FormControl('',{validators:[Validators.required, notBlank]}),
    type: new FormControl('',{validators:[Validators.required]}),
    description: new FormControl('',{validators:[Validators.required, notBlank]}),
    observationDate: new FormControl('',{validators:[Validators.required, validObservationDate]}),
    location: new FormControl('',{validators:[Validators.required, notBlank]}),
    latitude: new FormControl<number | null>(null,{validators:[Validators.required,Validators.min(-90),Validators.max(90)]}),
    longitude: new FormControl<number | null>(null,{validators:[Validators.required,Validators.min(-180),Validators.max(180)]}),
    photoUrl: new FormControl('',{validators:[Validators.pattern(/^\s*(https?:\/\/\S+\s*)?$/)]}),
  });

  ngOnInit(): void {
    if (this.initialValue) {
      // patchValue ignores fields the form does not have, such as the id of a saved pollution
      this.form.patchValue({ ...this.initialValue, photoUrl: this.initialValue.photoUrl ?? '' });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pollutionSubmitted.emit(this.normalize(this.form));
  }

  normalize(form:FormGroup): NewPollution{
    let formValue=form.getRawValue();
    const photoUrl = formValue.photoUrl?.trim();

    return {
      title: formValue.title.trim(),
      type: formValue.type,
      description: formValue.description.trim(),
      observationDate: formValue.observationDate,
      location: formValue.location.trim(),
      latitude: Number(formValue.latitude),
      longitude: Number(formValue.longitude),
      photoUrl: photoUrl || undefined,
    };
  }
}
