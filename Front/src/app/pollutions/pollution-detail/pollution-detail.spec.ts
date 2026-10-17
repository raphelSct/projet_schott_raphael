import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { Pollution } from '../../models/pollution';
import { PollutionService } from '../../services/pollution.service';
import { PollutionDetail } from './pollution-detail';

const pollution: Pollution = {
  id: '1',
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
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
    providers: [provideRouter([{ path: 'pollutions', children: [] }]), { provide: PollutionService, useValue: service }],
  });
  const fixture = TestBed.createComponent(PollutionDetail);
  fixture.componentRef.setInput('id', '1');
  await fixture.whenStable();
  return fixture;
}

const elementOf = (fixture: ComponentFixture<PollutionDetail>) => fixture.nativeElement as HTMLElement;

describe('PollutionDetail', () => {
  afterEach(() => vi.restoreAllMocks());

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

  it('goes back to the list once the pollution is deleted', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteSpy = vi.fn((): Observable<void> => of(undefined));
    const fixture = await showDetail({ getOne: () => of(pollution), delete: deleteSpy });

    elementOf(fixture).querySelector<HTMLButtonElement>('.delete')!.click();
    await fixture.whenStable();

    expect(deleteSpy).toHaveBeenCalledWith('1');
    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });
});
