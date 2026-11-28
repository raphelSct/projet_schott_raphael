import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { AddFavorite } from '../../core/states/favorites/favorites.actions';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { Pollution } from '../../models/pollution';
import { ConfirmService } from '../../services/confirm.service';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';
import { FavoriteList } from './favorite-list';

const dump: Pollution = {
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
const foam: Pollution = { ...dump, id: '2', title: 'Mousse sur le canal', type: 'water' };

// Opens the page with the given favorites already saved
async function showFavorites(
  favorites: Pollution[],
  getAll: () => Observable<Pollution[]> = () => NEVER,
  confirmed = true,
): Promise<ComponentFixture<FavoriteList>> {
  TestBed.configureTestingModule({
    imports: [FavoriteList],
    providers: [
      provideRouter([]),
      provideStore([FavoritesState]),
      { provide: PollutionService, useValue: { getAll } },
      { provide: ConfirmService, useValue: { ask: () => Promise.resolve(confirmed) } },
    ],
  });
  TestBed.inject(Store).dispatch(favorites.map((favorite) => new AddFavorite(favorite)));
  const fixture = TestBed.createComponent(FavoriteList);
  await fixture.whenStable();
  return fixture;
}

const titles = (fixture: ComponentFixture<FavoriteList>) =>
  [...(fixture.nativeElement as HTMLElement).querySelectorAll('.pollution h2')].map((h) => h.textContent?.trim());

describe('FavoriteList', () => {
  it('explains that there is no favorite yet, without a clear button', async () => {
    const getAll = vi.fn(() => of([]));
    const element = (await showFavorites([], getAll)).nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toBe('Mes Favoris');
    expect(element.querySelector('.state-message')?.textContent).toContain('Aucun favori enregistré');
    expect(element.querySelector('.clear')).toBeNull();
    // Nothing to refresh
    expect(getAll).not.toHaveBeenCalled();
  });

  it('shows the saved favorites while the API has not answered', async () => {
    expect(titles(await showFavorites([dump, foam]))).toEqual(['Décharge sauvage', 'Mousse sur le canal']);
  });

  it('shows the latest values of the API, and drops the pollutions that no longer exist', async () => {
    const fixture = await showFavorites([dump, foam], () => of([{ ...foam, title: 'Mousse disparue' }]));

    expect(titles(fixture)).toEqual(['Mousse disparue']);
  });

  it('keeps the saved favorites and says so when the API fails', async () => {
    const fixture = await showFavorites([dump], () => throwError(() => new Error('API unavailable')));

    expect(titles(fixture)).toEqual(['Décharge sauvage']);
    expect(TestBed.inject(ToastService).toasts()).toEqual([expect.objectContaining({ kind: 'error' })]);
  });

  it('removes a favorite with its star', async () => {
    const fixture = await showFavorites([dump, foam]);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.favorite')!.click();
    await fixture.whenStable();

    expect(titles(fixture)).toEqual(['Mousse sur le canal']);
  });

  it('clears all the favorites once confirmed', async () => {
    const fixture = await showFavorites([dump, foam]);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.clear')!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Store).selectSnapshot(FavoritesState.countFavorites)).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aucun favori enregistré');
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'success', message: 'Vos favoris ont été vidés.' }),
    ]);
  });

  it('keeps the favorites when the user cancels', async () => {
    const fixture = await showFavorites([dump, foam], () => NEVER, false);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.clear')!.click();
    await fixture.whenStable();

    expect(titles(fixture)).toHaveLength(2);
  });
});
