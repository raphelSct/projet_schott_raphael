import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProfilUtilisateur } from './profil-utilisateur/profil-utilisateur';
import { UtilisateurService } from './services/utilisateur.service';

@Component({
  imports: [ProfilUtilisateur, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly utilisateur = inject(UtilisateurService).utilisateur;
}
