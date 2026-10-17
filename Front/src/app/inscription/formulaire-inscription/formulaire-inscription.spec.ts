import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NouvelUtilisateur } from '../../models/utilisateur';
import { FormulaireInscription } from './formulaire-inscription';

const saisie = {
  prenom: ' Alice ',
  nom: 'Dupont',
  email: 'alice.dupont@example.com',
  login: 'adupont',
  motDePasse: 'motdepasse',
  confirmation: 'motdepasse',
};

describe('FormulaireInscription', () => {
  let component: FormulaireInscription;
  let fixture: ComponentFixture<FormulaireInscription>;
  let emissions: NouvelUtilisateur[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireInscription],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireInscription);
    component = fixture.componentInstance;
    emissions = [];
    component.inscription.subscribe((u) => emissions.push(u));
    await fixture.whenStable();
  });

  it("n'émet rien et affiche les erreurs si le formulaire est invalide", () => {
    component.envoyer();

    expect(emissions).toEqual([]);
    expect(component.formulaire.controls.login.touched).toBe(true);
  });

  it('refuse deux mots de passe différents', () => {
    component.formulaire.setValue({ ...saisie, confirmation: 'autrechose' });
    component.envoyer();

    expect(component.formulaire.hasError('motsDePasseDifferents')).toBe(true);
    expect(emissions).toEqual([]);
  });

  it('émet le nouvel utilisateur sans la confirmation', () => {
    component.formulaire.setValue(saisie);
    component.envoyer();

    expect(emissions).toEqual([
      { login: 'adupont', motDePasse: 'motdepasse', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' },
    ]);
  });
});
