import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { ClearFavorites, SyncFavorites } from '../../core/states/favorites/favorites.actions';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { PollutionCard } from '../../pollutions/pollution-card/pollution-card';
import { ConfirmService } from '../../services/confirm.service';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-favorite-list',
  imports: [PollutionCard, RouterLink],
  templateUrl: './favorite-list.html',
  styleUrl: './favorite-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteList implements OnInit {
  private readonly store = inject(Store);
  private readonly pollutionService = inject(PollutionService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);

  readonly favorites = this.store.selectSignal(FavoritesState.items);

  // The saved copies are shown at once, then refreshed with the latest values of the API
  ngOnInit(): void {
    if (this.favorites().length === 0) {
      return;
    }
    this.pollutionService.getAll().subscribe({
      next: (pollutions) => this.store.dispatch(new SyncFavorites(pollutions)),
      // The saved copies stay on screen
      error: () => this.toastService.error("Impossible d'actualiser les favoris : voici les informations enregistrées."),
    });
  }

  async clear(): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Vider tous vos favoris ?',
      message: 'La liste de vos favoris sera vidée. Les pollutions elles-mêmes ne sont pas supprimées.',
      confirmLabel: 'Vider',
    });
    if (confirmed) {
      this.store.dispatch(new ClearFavorites());
      this.toastService.success('Vos favoris ont été vidés.');
    }
  }
}
