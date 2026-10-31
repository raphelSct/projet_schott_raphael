import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NewUser } from '../models/user';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { SignupForm } from './signup-form/signup-form';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, SignupForm],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Signals rather than plain properties: the HTTP response arrives outside a template event,
  // and the application (without zone.js) only refreshes when a signal read by the template changes
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  signUp(newUser: NewUser): void {
    this.submitting.set(true);
    this.error.set(null);

    this.userService
      .signUp(newUser)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        // The service keeps the signed-up user: the rest of the application is now available
        next: (user) => {
          this.toastService.success(`Bienvenue ${user.firstName}, votre compte a été créé.`);
          this.router.navigate(['/pollutions']);
        },
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
