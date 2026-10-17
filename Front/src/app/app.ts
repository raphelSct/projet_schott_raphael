import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { UserProfile } from './user-profile/user-profile';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UserProfile],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly user = inject(UserService).user;
}
