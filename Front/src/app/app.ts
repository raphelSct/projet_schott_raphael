import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { FavoritesState } from './core/states/favorites/favorites.state';
import { Logout } from './store/auth.actions';
import { AuthState } from './store/auth.state';
import { ToastContainer } from './toast-container/toast-container';
import { UserProfile } from './user-profile/user-profile';

@Component({
  imports: [ConfirmDialog, RouterLink, RouterLinkActive, RouterOutlet, ToastContainer, UserProfile],
  selector: 'app-root',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  // Read from the store through its selectors, as signals
  readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  readonly user = this.store.selectSignal(AuthState.user);
  readonly username = this.store.selectSignal(AuthState.username);
  // Number shown next to the "Favoris" link
  readonly countFavorites = this.store.selectSignal(FavoritesState.countFavorites);

  logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => this.router.navigate(['/login']));
  }
}
