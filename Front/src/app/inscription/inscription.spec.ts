import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { NouvelUtilisateur, Utilisateur } from '../models/utilisateur';
import { UtilisateurService } from '../services/utilisateur.service';
import { FormulaireInscription } from './formulaire-inscription/formulaire-inscription';
import { Inscription } from './inscription';

const nouvelUtilisateur: NouvelUtilisateur = {
  login: 'adupont',
  motDePasse: 'motdepasse',
  nom: 'Dupont',
  prenom: 'Alice',
  email: 'alice.dupont@example.com',
};

// Simule une soumission valide du formulaire enfant, puis attend le rendu
async function soumettre(reponse: Observable<Utilisateur>): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [Inscription],
    providers: [
      provideRouter([{ path: 'declaration', children: [] }]),
      { provide: UtilisateurService, useValue: { inscrire: () => reponse } },
    ],
  });
  const fixture = TestBed.createComponent(Inscription);
  await fixture.whenStable();

  const formulaire = fixture.debugElement.query(By.directive(FormulaireInscription));
  (formulaire.componentInstance as FormulaireInscription).inscription.emit(nouvelUtilisateur);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Inscription', () => {
  it("ouvre la déclaration une fois l'inscription réussie", async () => {
    await soumettre(of({ id: 'abc', login: 'adupont', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' }));

    expect(TestBed.inject(Router).url).toBe('/declaration');
  });

  it("garde le formulaire et affiche l'erreur si l'API échoue", async () => {
    const element = await soumettre(throwError(() => new Error('Ce login ou cet email est déjà utilisé.')));

    expect(TestBed.inject(Router).url).toBe('/');
    expect(element.querySelector('app-formulaire-inscription')).toBeTruthy();
    expect(element.querySelector('.erreur-api')?.textContent).toContain('déjà utilisé');
  });
});
