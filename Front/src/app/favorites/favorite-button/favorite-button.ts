import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { ToggleFavorite } from '../../core/states/favorites/favorites.actions';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { Pollution } from '../../models/pollution';
import { ToastService } from '../../services/toast.service';

// Star that pins or unpins a pollution: full star when it is a favorite
@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteButton {
  @Input({ required: true }) pollution!: Pollution;
  // The star alone on the cards, with its text on the detail page
  @Input() showLabel = false;

  private readonly store = inject(Store);
  private readonly toastService = inject(ToastService);

  readonly isFavorite = this.store.selectSignal(FavoritesState.isFavorite);

  toggle(): void {
    const removing = this.isFavorite()(this.pollution.id);
    this.store.dispatch(new ToggleFavorite(this.pollution));
    this.toastService.success(
      removing
        ? `« ${this.pollution.title} » a été retirée des favoris.`
        : `« ${this.pollution.title} » a été ajoutée aux favoris.`,
    );
  }
}
