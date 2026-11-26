import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

// Login and signup pages are for visitors: a logged-in user (who goes back with the browser, for example)
// is sent to the application instead of seeing a login form again.
export const guestGuard: CanMatchFn = () =>
  inject(UserService).user() ? inject(Router).createUrlTree(['/pollutions']) : true;
