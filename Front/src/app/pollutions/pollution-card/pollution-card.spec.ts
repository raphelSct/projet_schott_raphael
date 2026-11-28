import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { Pollution } from '../../models/pollution';
import { PollutionCard } from './pollution-card';

// A page that projects its own button into the card
@Component({
  imports: [PollutionCard],
  template: `<app-pollution-card [pollution]="pollution"><button class="extra">Autre action</button></app-pollution-card>`,
})
class Host {
  readonly pollution: Pollution = {
    id: '1',
    title: 'Décharge sauvage',
    type: 'illegal-dumping',
    severityIndex: 72,
    description: 'Sacs poubelle sur la berge',
    observationDate: '2026-10-01',
    location: 'Paris',
    latitude: 48.8443,
    longitude: 2.3706,
  };
}

describe('PollutionCard', () => {
  it('shows the pollution, a link to its detail, the projected button and the favorite star', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideStore([FavoritesState])] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Décharge sauvage');
    expect(element.querySelector('.badge')?.textContent).toBe('Dépôt sauvage');
    expect(element.querySelector('h2 a')?.getAttribute('href')).toBe('/pollutions/1');
    expect(element.querySelector('.no-photo')).toBeTruthy();
    expect(element.querySelector('.buttons .extra')).toBeTruthy();
    expect(element.querySelector('.buttons app-favorite-button .star')?.textContent?.trim()).toBe('☆');
  });
});
