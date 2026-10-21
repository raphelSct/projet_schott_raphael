import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

// The rest of the application is only available once the user has signed up
export const signupRequiredGuard: CanActivateFn = () => {
  const user = inject(UserService).user();
  return user ? true : inject(Router).createUrlTree(['/signup']);
};
