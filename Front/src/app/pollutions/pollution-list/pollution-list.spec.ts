import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Pollution } from '../../models/pollution';
import { PollutionService } from '../../services/pollution.service';
import { PollutionList } from './pollution-list';

const pollutions: Pollution[] = [
  {
    id: '1',
    title: 'Décharge sauvage',
    type: 'illegal-dumping',
    description: 'Sacs poubelle sur la berge',
    observationDate: '2026-10-01',
    location: 'Paris',
    latitude: 48.8443,
    longitude: 2.3706,
  },
  {
    id: '2',
    title: 'Mousse sur le canal',
    type: 'water',
    description: 'Mousse blanchâtre',
    observationDate: '2026-09-22',
    location: 'Paris',
    latitude: 48.8721,
    longitude: 2.3658,
  },
  {
    id: '3',
    title: 'Bouteilles sur la plage',
    type: 'plastic',
    description: 'Emballages ramenés par la marée',
    observationDate: '2026-08-14',
    location: 'Marseille',
    latitude: 43.2593,
    longitude: 5.3756,
  },
];

// Opens the page with fake answers from the API
async function showList(
  service: { getAll: () => Observable<Pollution[]>; delete?: (id: string) => Observable<void> },
): Promise<ComponentFixture<PollutionList>> {
  TestBed.configureTestingModule({
    imports: [PollutionList],
    providers: [provideRouter([]), { provide: PollutionService, useValue: service }],
  });
  const fixture = TestBed.createComponent(PollutionList);
  await fixture.whenStable();
  return fixture;
}

const titles = (element: HTMLElement) => [...element.querySelectorAll('.pollution h2')].map((h) => h.textContent?.trim());

describe('PollutionList', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the pollutions returned by the API, with their type label', async () => {
    const element = (await showList({ getAll: () => of(pollutions) })).nativeElement as HTMLElement;

    expect(titles(element)).toEqual(['Décharge sauvage', 'Mousse sur le canal', 'Bouteilles sur la plage']);
    expect(element.querySelector('.pollution .badge')?.textContent).toBe('Dépôt sauvage');
    expect(element.querySelector('.count')?.textContent).toContain('3 pollutions');
  });

  it('shows a message when the API fails', async () => {
    const element = (await showList({ getAll: () => throwError(() => new Error('API unavailable')) })).nativeElement as HTMLElement;

    expect(element.querySelector('.api-error')).toBeTruthy();
    expect(element.querySelector('.grid')).toBeNull();
  });

  describe('filters', () => {
    let fixture: ComponentFixture<PollutionList>;
    let element: HTMLElement;

    beforeEach(async () => {
      fixture = await showList({ getAll: () => of(pollutions) });
      element = fixture.nativeElement as HTMLElement;
    });

    async function filter(values: Partial<{ search: string; type: string; from: string; to: string }>) {
      fixture.componentInstance.filters.patchValue(values);
      await fixture.whenStable();
    }

    it('searches the text without caring about case or accents', async () => {
      await filter({ search: 'BLANCHATRE' });

      expect(titles(element)).toEqual(['Mousse sur le canal']);
      expect(element.querySelector('.count')?.textContent).toContain('1 pollution');
      expect(element.querySelector('.count')?.textContent).toContain('sur 3');
    });

    it('also searches the French label of the type', async () => {
      await filter({ search: 'dépôt' });

      expect(titles(element)).toEqual(['Décharge sauvage']);
    });

    it('keeps only the selected type', async () => {
      await filter({ type: 'plastic' });

      expect(titles(element)).toEqual(['Bouteilles sur la plage']);
    });

    it('keeps the pollutions observed between the two dates, both included', async () => {
      await filter({ from: '2026-09-01', to: '2026-10-01' });

      expect(titles(element)).toEqual(['Décharge sauvage', 'Mousse sur le canal']);
    });

    it('combines the criteria, and says when nothing matches', async () => {
      await filter({ search: 'paris', type: 'plastic' });

      expect(titles(element)).toEqual([]);
      expect(element.querySelector('.grid .state-message')?.textContent).toContain('Aucune pollution ne correspond');
    });

    it('shows the whole list again after a reset', async () => {
      await filter({ type: 'water' });
      element.querySelector<HTMLButtonElement>('.reset button')!.click();
      await fixture.whenStable();

      expect(titles(element)).toHaveLength(3);
    });
  });

  describe('deletion', () => {
    it('removes the pollution from the list once the API confirms', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteSpy = vi.fn(() => of(undefined));
      const fixture = await showList({ getAll: () => of(pollutions), delete: deleteSpy });
      const element = fixture.nativeElement as HTMLElement;

      element.querySelector<HTMLButtonElement>('.card-actions button')!.click();
      await fixture.whenStable();

      expect(deleteSpy).toHaveBeenCalledWith('1');
      expect(titles(element)).toEqual(['Mousse sur le canal', 'Bouteilles sur la plage']);
    });

    it('does nothing when the user cancels', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const deleteSpy = vi.fn(() => of(undefined));
      const fixture = await showList({ getAll: () => of(pollutions), delete: deleteSpy });

      (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.card-actions button')!.click();
      await fixture.whenStable();

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('keeps the list and shows a message when the deletion fails', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const fixture = await showList({
        getAll: () => of(pollutions),
        delete: () => throwError(() => new Error('API unavailable')),
      });
      const element = fixture.nativeElement as HTMLElement;

      element.querySelector<HTMLButtonElement>('.card-actions button')!.click();
      await fixture.whenStable();

      expect(titles(element)).toHaveLength(3);
      expect(element.querySelector('.api-error')?.textContent).toContain('La suppression');
    });
  });
});
