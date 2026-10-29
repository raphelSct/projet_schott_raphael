import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NewUser } from '../../models/user';

const notBlank = Validators.pattern(/\S/);

// Group validator: it needs both fields to compare them
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, passwordConfirmation } = group.value;
  return passwordConfirmation && password !== passwordConfirmation ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  // Disables the button during the API call, handled by the parent component
  @Input() submitting = false;
  @Output() userSubmitted = new EventEmitter<NewUser>();

  form = new FormGroup(
    {
      firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, notBlank] }),
      lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, notBlank] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\S+$/)] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      passwordConfirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();

    // The confirmation is only used while typing: it is not sent to the API
    this.userSubmitted.emit({
      username: values.username,
      password: values.password,
      lastName: values.lastName.trim(),
      firstName: values.firstName.trim(),
      email: values.email,
    });
  }
}
