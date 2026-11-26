import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { finalize, switchMap } from 'rxjs';
import { Credentials } from '../models/user';
import { UserService } from '../services/user.service';
// Renamed: this component is also called Login
import { Login as LoginAction } from '../store/auth.actions';
import { LoginForm } from './login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [LoginForm, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  // Page the visitor asked for before being sent here (?returnUrl=…, see authGuard), read thanks to withComponentInputBinding()
  @Input() returnUrl?: string;

  private readonly userService = inject(UserService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  // Signals: the HTTP response arrives outside a template event (application without zone.js)
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  logIn(credentials: Credentials): void {
    this.submitting.set(true);
    this.error.set(null);

    this.userService
      .login(credentials)
      .pipe(
        // The API has checked the password: the store now knows who is logged in
        switchMap((user) =>
          this.store.dispatch(new LoginAction({ email: user.email, name: `${user.firstName} ${user.lastName}` })),
        ),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        // The rest of the application is now available.
        // The router only navigates inside the application, so an odd returnUrl cannot lead anywhere else.
        next: () => this.router.navigateByUrl(this.returnUrl || '/pollutions'),
        error: (error: Error) => this.error.set(error.message),
      });
  }
}
