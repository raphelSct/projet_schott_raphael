import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { finalize, switchMap } from 'rxjs';
import { NewUser } from '../models/user';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { Login } from '../store/auth.actions';
import { SignupForm } from './signup-form/signup-form';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, SignupForm],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup {
  private readonly userService = inject(UserService);
  private readonly store = inject(Store);
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
      .pipe(
        // A new account is logged in right away
        switchMap((user) => {
          this.toastService.success(`Bienvenue ${user.firstName}, votre compte a été créé.`);
          return this.store.dispatch(new Login({ email: user.email, name: `${user.firstName} ${user.lastName}` }));
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        // The rest of the application is now available
        next: () => this.router.navigate(['/pollutions']),
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
