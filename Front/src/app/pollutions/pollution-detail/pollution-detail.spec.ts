import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { AddFavorite } from '../../core/states/favorites/favorites.actions';
import { FavoritesState } from '../../core/states/favorites/favorites.state';
import { Pollution } from '../../models/pollution';
import { ConfirmService } from '../../services/confirm.service';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';
import { PollutionDetail } from './pollution-detail';

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

// Opens /pollutions/1 with fake answers from the API
async function showDetail(service: Partial<Record<keyof PollutionService, unknown>>): Promise<ComponentFixture<PollutionDetail>> {
  TestBed.configureTestingModule({
    imports: [PollutionDetail],
    providers: [
      provideRouter([{ path: 'pollutions', children: [] }]),
      provideStore([FavoritesState]),
      { provide: PollutionService, useValue: service },
      // The user confirms in the dialog
      { provide: ConfirmService, useValue: { ask: () => Promise.resolve(true) } },
    ],
  });
  const fixture = TestBed.createComponent(PollutionDetail);
  fixture.componentRef.setInput('id', '1');
  await fixture.whenStable();
  return fixture;
}

const elementOf = (fixture: ComponentFixture<PollutionDetail>) => fixture.nativeElement as HTMLElement;

describe('PollutionDetail', () => {

  it('shows the loading message while the pollution is unknown', async () => {
    // NEVER: the API never answers, so the page stays in its loading state
    const element = elementOf(await showDetail({ getOne: () => NEVER }));

    expect(element.querySelector('.state-message')).toBeTruthy();
  });

  it('shows the pollution returned by the API', async () => {
    const element = elementOf(await showDetail({ getOne: () => of(pollution) }));

    expect(element.querySelector('h1')?.textContent).toContain('Décharge sauvage');
    expect(element.querySelector('.edit')?.getAttribute('href')).toBe('/pollutions/1/edit');
  });

  it('explains that the pollution does not exist on a 404', async () => {
    const element = elementOf(await showDetail({ getOne: () => throwError(() => new HttpErrorResponse({ status: 404 })) }));

    expect(element.querySelector('.api-error')?.textContent).toContain("n'existe pas");
  });

  it('goes back to the list with a toast once the pollution is deleted', async () => {
    const deleteSpy = vi.fn((): Observable<void> => of(undefined));
    const fixture = await showDetail({ getOne: () => of(pollution), delete: deleteSpy });

    elementOf(fixture).querySelector<HTMLButtonElement>('.delete')!.click();
    await fixture.whenStable();

    expect(deleteSpy).toHaveBeenCalledWith('1');
    expect(TestBed.inject(Router).url).toBe('/pollutions');
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'success', message: '« Décharge sauvage » a été supprimée.' }),
    ]);
  });

  it('can pin the pollution, and removes it from the favorites once deleted', async () => {
    const fixture = await showDetail({ getOne: () => of(pollution), delete: () => of(undefined) });
    const store = TestBed.inject(Store);
    const star = elementOf(fixture).querySelector<HTMLButtonElement>('.favorite')!;
    expect(star.textContent).toContain('Ajouter aux favoris');

    star.click();
    await fixture.whenStable();
    expect(store.selectSnapshot(FavoritesState.items)).toEqual([pollution]);
    expect(star.textContent).toContain('Retirer des favoris');

    elementOf(fixture).querySelector<HTMLButtonElement>('.delete')!.click();
    await fixture.whenStable();
    expect(store.selectSnapshot(FavoritesState.items)).toEqual([]);
  });

  it('stays on the page and shows an error toast when the deletion fails', async () => {
    const fixture = await showDetail({ getOne: () => of(pollution), delete: () => throwError(() => new Error('API unavailable')) });

    elementOf(fixture).querySelector<HTMLButtonElement>('.delete')!.click();
    await fixture.whenStable();

    expect(elementOf(fixture).querySelector('app-pollution-info')).toBeTruthy();
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'error', message: 'La suppression a échoué. Réessayez plus tard.' }),
    ]);
  });
});
