import { TestBed } from '@angular/core/testing';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { Store, provideStore } from '@ngxs/store';
import { Pollution } from '../../../models/pollution';
import { AddFavorite, ClearFavorites, RemoveFavorite, SyncFavorites, ToggleFavorite } from './favorites.actions';
import { FavoritesState } from './favorites.state';

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

// The store configured like in app.config.ts, persistence included
function createStore(): Store {
  TestBed.configureTestingModule({
    providers: [provideStore([FavoritesState], withNgxsStoragePlugin({ keys: ['favorites'] }))],
  });
  return TestBed.inject(Store);
}

describe('FavoritesState', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  const titles = (store: Store) => store.selectSnapshot(FavoritesState.items).map((item) => item.title);

  it('starts empty', () => {
    const store = createStore();

    expect(store.selectSnapshot(FavoritesState.items)).toEqual([]);
    expect(store.selectSnapshot(FavoritesState.countFavorites)).toBe(0);
  });

  it('adds favorites without ever duplicating an id', () => {
    const store = createStore();

    store.dispatch(new AddFavorite(dump));
    store.dispatch(new AddFavorite(foam));
    store.dispatch(new AddFavorite({ ...dump, title: 'Same id' }));

    expect(titles(store)).toEqual(['Décharge sauvage', 'Mousse sur le canal']);
    expect(store.selectSnapshot(FavoritesState.countFavorites)).toBe(2);
  });

  it('removes the favorite of the given id, and clears them all', () => {
    const store = createStore();
    store.dispatch([new AddFavorite(dump), new AddFavorite(foam)]);

    store.dispatch(new RemoveFavorite('1'));
    expect(titles(store)).toEqual(['Mousse sur le canal']);

    store.dispatch(new ClearFavorites());
    expect(titles(store)).toEqual([]);
  });

  it('toggles a pollution in and out of the favorites', () => {
    const store = createStore();
    const isFavorite = () => store.selectSnapshot(FavoritesState.isFavorite)('1');

    store.dispatch(new ToggleFavorite(dump));
    expect(isFavorite()).toBe(true);

    store.dispatch(new ToggleFavorite(dump));
    expect(isFavorite()).toBe(false);
  });

  it('never mutates the previous list', () => {
    const store = createStore();
    store.dispatch(new AddFavorite(dump));
    const before = store.selectSnapshot(FavoritesState.items);

    store.dispatch(new AddFavorite(foam));
    store.dispatch(new RemoveFavorite('1'));

    expect(before).toEqual([dump]);
    expect(store.selectSnapshot(FavoritesState.items)).not.toBe(before);
  });

  it('brings the favorites up to date, and drops those that no longer exist', () => {
    const store = createStore();
    store.dispatch([new AddFavorite(dump), new AddFavorite(foam)]);

    store.dispatch(new SyncFavorites([{ ...foam, title: 'Mousse disparue' }, { ...dump, id: '3' }]));

    expect(titles(store)).toEqual(['Mousse disparue']);
  });

  it('saves the favorites in localStorage, under the "favorites" key', () => {
    const store = createStore();

    store.dispatch(new AddFavorite(dump));

    expect(JSON.parse(localStorage.getItem('favorites')!)).toEqual({ items: [dump] });
  });

  it('restores the favorites of a previous visit, as after a page reload', () => {
    localStorage.setItem('favorites', JSON.stringify({ items: [dump, foam] }));

    const store = createStore();

    expect(titles(store)).toEqual(['Décharge sauvage', 'Mousse sur le canal']);
    expect(store.selectSnapshot(FavoritesState.countFavorites)).toBe(2);
  });
});
