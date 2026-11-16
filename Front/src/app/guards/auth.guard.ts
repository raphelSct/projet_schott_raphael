import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

// Pages reserved for logged-in users.
// A guard on "canMatch" (rather than "canActivate") runs before the lazy-loaded code of the page is downloaded:
// a visitor who is not logged in never gets it.
// The page asked for is kept in "returnUrl", so that the login page can send the user back to it.
export const authGuard: CanMatchFn = () => {
  if (inject(UserService).user()) {
    return true;
  }

  const router = inject(Router);
  const target = router.currentNavigation()?.extractedUrl;
  const returnUrl = target ? router.serializeUrl(target) : '/';
  // The home page needs no memory: it is where the user lands anyway
  return router.createUrlTree(['/login'], { queryParams: returnUrl === '/' ? {} : { returnUrl } });
};
