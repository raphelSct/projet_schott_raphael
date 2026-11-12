import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Credentials } from '../models/user';
import { UserService } from '../services/user.service';
import { LoginForm } from './login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [LoginForm, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // Signals: the HTTP response arrives outside a template event (application without zone.js)
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  logIn(credentials: Credentials): void {
    this.submitting.set(true);
    this.error.set(null);

    this.userService
      .login(credentials)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        // The service keeps the logged-in user: the rest of the application is now available
        next: () => this.router.navigate(['/pollutions']),
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
