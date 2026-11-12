import { Directive, HostBinding, Input } from '@angular/core';
import { PollutionLevel, getPollutionLevel } from '../models/pollution-level';

// Background of each level: variables declared in the global styles (src/styles.scss)
const LEVEL_COLORS: Record<PollutionLevel, string> = {
  low: 'var(--level-low)',
  moderate: 'var(--level-moderate)',
  high: 'var(--level-high)',
  dangerous: 'var(--level-dangerous)',
};

// Colors the background of an element according to the level of a pollution, given its severity index:
// <span [appHighlightPollution]="pollution.severityIndex">…</span>
@Directive({ selector: '[appHighlightPollution]' })
export class HighlightPollutionDirective {
  @Input({ required: true }) appHighlightPollution: number | null | undefined;

  // null removes the style: without a valid index, the element keeps its own background
  @HostBinding('style.background-color')
  get backgroundColor(): string | null {
    const level = getPollutionLevel(this.appHighlightPollution);
    return level ? LEVEL_COLORS[level] : null;
  }
}
