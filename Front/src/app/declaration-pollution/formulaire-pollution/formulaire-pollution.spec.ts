import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pollution } from '../../models/pollution';
import { FormulairePollution } from './formulaire-pollution';

const pollution: Pollution = {
  titre: 'Décharge sauvage',
  type: 'Dépôt sauvage',
  description: 'Sacs poubelle sur la berge',
  dateObservation: '2026-10-01',
  lieu: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};

describe('FormulairePollution', () => {
  let component: FormulairePollution;
  let fixture: ComponentFixture<FormulairePollution>;
  let emissions: Pollution[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulairePollution],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulairePollution);
    component = fixture.componentInstance;
    emissions = [];
    component.pollutionDeclaree.subscribe((p) => emissions.push(p));
  });

  it("n'émet rien et affiche les erreurs si le formulaire est invalide", async () => {
    await fixture.whenStable();
    component.declarer();

    expect(emissions).toEqual([]);
    expect(component.formulaire.controls.titre.touched).toBe(true);
  });

  it('émet la déclaration normalisée si le formulaire est valide', async () => {
    await fixture.whenStable();
    component.formulaire.setValue({ ...pollution, titre: '  Décharge sauvage  ', photoUrl: '   ' });
    component.declarer();

    expect(emissions).toEqual([{ ...pollution, photoUrl: undefined }]);
  });

  it('se pré-remplit avec la valeur initiale', async () => {
    fixture.componentRef.setInput('valeurInitiale', pollution);
    await fixture.whenStable();

    expect(component.formulaire.getRawValue()).toEqual({ ...pollution, photoUrl: '' });
  });
});
