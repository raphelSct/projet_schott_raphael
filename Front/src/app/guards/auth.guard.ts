import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth.state';

// Pages reserved for logged-in users, according to the store.
// A guard on "canMatch" (rather than "canActivate") runs before the lazy-loaded code of the page is downloaded:
// a visitor who is not logged in never gets it.
// The page asked for is kept in "returnUrl", so that the login page can send the user back to it.
export const authGuard: CanMatchFn = () => {
  if (inject(Store).selectSnapshot(AuthState.isAuthenticated)) {
    return true;
  }

  const router = inject(Router);
  const target = router.currentNavigation()?.extractedUrl;
  const returnUrl = target ? router.serializeUrl(target) : '/';
  // The home page needs no memory: it is where the user lands anyway
  return router.createUrlTree(['/login'], { queryParams: returnUrl === '/' ? {} : { returnUrl } });
};
