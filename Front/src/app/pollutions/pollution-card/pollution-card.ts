import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighlightPollutionDirective } from '../../directives/highlight-pollution.directive';
import { FavoriteButton } from '../../favorites/favorite-button/favorite-button';
import { Pollution } from '../../models/pollution';
import { PollutionLevelPipe } from '../../pipes/pollution-level.pipe';
import { PollutionTypeLabelPipe } from '../../pipes/pollution-type-label.pipe';

// Card of a pollution, shared by the list and the favorites page.
// A page can project its own buttons, shown next to the favorite star.
@Component({
  selector: 'app-pollution-card',
  imports: [DatePipe, FavoriteButton, HighlightPollutionDirective, PollutionLevelPipe, PollutionTypeLabelPipe, RouterLink],
  templateUrl: './pollution-card.html',
  styleUrl: './pollution-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionCard {
  @Input({ required: true }) pollution!: Pollution;
}
