import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { Pollution } from '../../models/pollution';
import { ToastService } from '../../services/toast.service';
import { FavoriteButton } from './favorite-button';

const pollution: Pollution = {
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

describe('FavoriteButton', () => {
  let fixture: ComponentFixture<FavoriteButton>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FavoriteButton], providers: [provideStore([FavoritesState])] });
    fixture = TestBed.createComponent(FavoriteButton);
    fixture.componentRef.setInput('pollution', pollution);
    await fixture.whenStable();
    button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
  });

  const star = () => button.querySelector('.star')!.textContent!.trim();

  async function click(): Promise<void> {
    button.click();
    await fixture.whenStable();
  }

  it('shows an empty star and offers to add the pollution', () => {
    expect(star()).toBe('☆');
    expect(button.getAttribute('aria-label')).toBe('Ajouter aux favoris : Décharge sauvage');
  });

  it('adds the pollution on a click, then removes it on the next one, with a toast each time', async () => {
    const store = TestBed.inject(Store);

    await click();
    expect(store.selectSnapshot(FavoritesState.items)).toEqual([pollution]);
    expect(star()).toBe('★');
    expect(button.getAttribute('aria-label')).toBe('Retirer des favoris : Décharge sauvage');

    await click();
    expect(store.selectSnapshot(FavoritesState.items)).toEqual([]);
    expect(star()).toBe('☆');

    expect(TestBed.inject(ToastService).toasts().map((t) => t.message)).toEqual([
      '« Décharge sauvage » a été ajoutée aux favoris.',
      '« Décharge sauvage » a été retirée des favoris.',
    ]);
  });

  it('writes the action next to the star when asked to', async () => {
    fixture.componentRef.setInput('showLabel', true);
    await fixture.whenStable();

    expect(button.textContent).toContain('Ajouter aux favoris');
    expect(button.hasAttribute('aria-label')).toBe(false);
  });
});
