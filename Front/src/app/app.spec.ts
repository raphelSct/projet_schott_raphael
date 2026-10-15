import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { Utilisateur } from './models/utilisateur';
import { UtilisateurService } from './services/utilisateur.service';

const alice: Utilisateur = { id: '1', login: 'adupont', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' };

// Crée l'application avec un utilisateur déjà inscrit (ou non), puis ouvre la page d'accueil
async function ouvrirAccueil(utilisateur: Utilisateur | null): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      { provide: UtilisateurService, useValue: { utilisateur: signal(utilisateur) } },
    ],
  });
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl('/');
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('App', () => {
  it("redirige vers l'inscription tant que personne n'est inscrit", async () => {
    const compiled = await ouvrirAccueil(null);

    expect(compiled.querySelector('h1')?.textContent).toContain('Inscription');
    expect(compiled.querySelector('a[href="/declaration"]')).toBeNull();
    expect(compiled.querySelector('app-profil-utilisateur')).toBeNull();
  });

  it("donne accès à la déclaration et au profil une fois inscrit", async () => {
    const compiled = await ouvrirAccueil(alice);

    expect(compiled.querySelector('h1')?.textContent).toContain('Déclarer une pollution');
    expect(compiled.querySelector('app-profil-utilisateur button')?.textContent).toContain('AD');
  });
});
