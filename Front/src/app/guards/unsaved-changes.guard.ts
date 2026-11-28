import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfirmService } from '../services/confirm.service';
import { AuthState } from '../store/auth.state';

// A page that can hold changes not saved yet (a form)
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// Asks for confirmation before leaving a form whose content has not been saved.
// Nothing is asked once the user has logged out: the draft belongs to a session that is over.
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges() || !inject(Store).selectSnapshot(AuthState.isAuthenticated)) {
    return true;
  }
  return inject(ConfirmService).ask({
    title: 'Quitter cette page ?',
    message: 'Les informations saisies ne sont pas enregistrées : elles seront perdues si vous quittez la page.',
    confirmLabel: 'Quitter la page',
  });
};
