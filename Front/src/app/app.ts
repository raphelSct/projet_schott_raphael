import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { UserService } from './services/user.service';
import { ToastContainer } from './toast-container/toast-container';
import { UserProfile } from './user-profile/user-profile';

@Component({
  imports: [ConfirmDialog, RouterLink, RouterLinkActive, RouterOutlet, ToastContainer, UserProfile],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly user = this.userService.user;

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
