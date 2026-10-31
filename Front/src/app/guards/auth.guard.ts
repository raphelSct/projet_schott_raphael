import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

// The rest of the application is only available once the user has logged in or signed up
export const authGuard: CanActivateFn = () => {
  const user = inject(UserService).user();
  return user ? true : inject(Router).createUrlTree(['/login']);
};
