import { TestBed } from '@angular/core/testing';
import { NewPollution } from '../../models/pollution';
import { PollutionInfo } from './pollution-info';

const pollution: NewPollution = {
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
  description: 'Sacs poubelle sur la berge',
  observationDate: '2026-10-01',
  location: 'Quai de la Rapée',
  latitude: 48.8443,
  longitude: 2.3706,
};

describe('PollutionInfo', () => {
  it('shows the pollution, its type label and a link to the map', async () => {
    const fixture = TestBed.createComponent(PollutionInfo);
    fixture.componentRef.setInput('pollution', pollution);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Décharge sauvage');
    expect(element.querySelector('.badge')?.textContent).toBe('Dépôt sauvage');
    expect(element.querySelector('.details')?.textContent).toContain('Quai de la Rapée');
    expect(element.querySelector<HTMLAnchorElement>('.map-link')?.href).toContain('mlat=48.8443&mlon=2.3706');
    expect(element.querySelector('.photo')).toBeNull();
  });
});
