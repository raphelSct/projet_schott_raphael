import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Pollution } from '../../../models/pollution';
import { AddFavorite, ClearFavorites, RemoveFavorite, SyncFavorites, ToggleFavorite } from './favorites.actions';

export interface FavoritesStateModel {
  items: Pollution[];
}

// Pollutions pinned by the user. Saved in localStorage by the storage plugin (see app.config.ts).
// The state is never mutated: every change gives a new array.
@State<FavoritesStateModel>({ name: 'favorites', defaults: { items: [] } })
@Injectable()
export class FavoritesState {
  @Selector()
  static items(state: FavoritesStateModel): Pollution[] {
    return state.items;
  }

  @Selector()
  static countFavorites(state: FavoritesStateModel): number {
    return state.items.length;
  }

  // Asked by every favorite button. Memoized: the set of ids is only rebuilt when the favorites change
  @Selector()
  static isFavorite(state: FavoritesStateModel): (pollutionId: number | string) => boolean {
    const ids = new Set<number | string>(state.items.map((item) => item.id));
    return (pollutionId) => ids.has(pollutionId);
  }

  @Action(AddFavorite)
  add(context: StateContext<FavoritesStateModel>, { pollution }: AddFavorite): void {
    const { items } = context.getState();
    // No duplicate: a pollution is identified by its id
    if (!items.some((item) => item.id === pollution.id)) {
      context.patchState({ items: [...items, pollution] });
    }
  }

  @Action(RemoveFavorite)
  remove(context: StateContext<FavoritesStateModel>, { pollutionId }: RemoveFavorite): void {
    context.patchState({ items: context.getState().items.filter((item) => item.id !== pollutionId) });
  }

  @Action(ClearFavorites)
  clear(context: StateContext<FavoritesStateModel>): void {
    context.patchState({ items: [] });
  }

  @Action(ToggleFavorite)
  toggle(context: StateContext<FavoritesStateModel>, { pollution }: ToggleFavorite): Observable<void> {
    const pinned = context.getState().items.some((item) => item.id === pollution.id);
    return context.dispatch(pinned ? new RemoveFavorite(pollution.id) : new AddFavorite(pollution));
  }

  // Each favorite takes the latest values of its pollution; those the API no longer has are removed
  @Action(SyncFavorites)
  sync(context: StateContext<FavoritesStateModel>, { pollutions }: SyncFavorites): void {
    const latest = new Map(pollutions.map((pollution) => [pollution.id, pollution]));
    context.patchState({ items: context.getState().items.flatMap((item) => latest.get(item.id) ?? []) });
  }
}
