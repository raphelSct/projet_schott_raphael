import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution.directive';

@Component({
  imports: [HighlightPollutionDirective],
  template: `
    @for (index of indexes(); track $index) {
      <span class="tag" [appHighlightPollution]="index">{{ index }}</span>
    }
  `,
})
class Host {
  // A signal: the application has no zone.js, so a plain property would not refresh the view
  readonly indexes = signal<(number | null)[]>([0, 20, 21, 50, 51, 100, 101, null]);
}

describe('HighlightPollutionDirective', () => {
  const backgrounds = (element: HTMLElement) =>
    [...element.querySelectorAll<HTMLElement>('.tag')].map((tag) => tag.style.backgroundColor);

  it('colors the background according to the level of each index', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    expect(backgrounds(fixture.nativeElement)).toEqual([
      'var(--level-low)',
      'var(--level-low)',
      'var(--level-moderate)',
      'var(--level-moderate)',
      'var(--level-high)',
      'var(--level-high)',
      'var(--level-dangerous)',
      '', // no index: no color
    ]);
  });

  it('follows the index when it changes', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.indexes.set([10]);
    await fixture.whenStable();
    expect(backgrounds(fixture.nativeElement)).toEqual(['var(--level-low)']);

    fixture.componentInstance.indexes.set([150]);
    await fixture.whenStable();
    expect(backgrounds(fixture.nativeElement)).toEqual(['var(--level-dangerous)']);

    fixture.componentInstance.indexes.set([null]);
    await fixture.whenStable();
    expect(backgrounds(fixture.nativeElement)).toEqual(['']);
  });
});
