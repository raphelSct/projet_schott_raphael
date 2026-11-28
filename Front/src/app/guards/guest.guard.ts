import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

// Login and signup pages are for visitors: a logged-in user (who goes back with the browser, for example)
// is sent to the application instead of seeing a login form again.
export const guestGuard: CanMatchFn = () =>
  inject(Store).selectSnapshot(AuthState.isAuthenticated) ? inject(Router).createUrlTree(['/pollutions']) : true;
