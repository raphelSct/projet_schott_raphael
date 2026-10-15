import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Pollution } from '../models/pollution';
import { DeclarationPollution } from './declaration-pollution';
import { FormulairePollution } from './formulaire-pollution/formulaire-pollution';

const pollution: Pollution = {
  titre: 'Décharge sauvage',
  type: 'Dépôt sauvage',
  description: 'Sacs poubelle sur la berge',
  dateObservation: '2026-10-01',
  lieu: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};

describe('DeclarationPollution', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationPollution],
    }).compileComponents();
  });

  it('affiche le récap, puis revient au formulaire pré-rempli', async () => {
    const fixture = TestBed.createComponent(DeclarationPollution);
    const element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    const formulaire = fixture.debugElement.query(By.directive(FormulairePollution));
    (formulaire.componentInstance as FormulairePollution).pollutionDeclaree.emit(pollution);
    await fixture.whenStable();

    expect(element.querySelector('app-formulaire-pollution')).toBeNull();
    expect(element.querySelector('app-recap-declaration h1')?.textContent).toContain('Décharge sauvage');

    element.querySelector<HTMLButtonElement>('app-recap-declaration button')!.click();
    await fixture.whenStable();

    expect(element.querySelector('app-recap-declaration')).toBeNull();
    expect(element.querySelector<HTMLInputElement>('#titre')?.value).toBe('Décharge sauvage');
  });
});
