import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { NewPollution, Pollution } from '../models/pollution';
import { PollutionService } from '../services/pollution.service';
import { ToastService } from '../services/toast.service';
import { PollutionForm } from './pollution-form/pollution-form';
import { PollutionReport } from './pollution-report';

const newPollution: NewPollution = {
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
  description: 'Sacs poubelle sur la berge',
  observationDate: '2026-10-01',
  location: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};

// Opens the page, then submits the form with the given answer from the API
async function report(response: Observable<Pollution>): Promise<ComponentFixture<PollutionReport>> {
  TestBed.configureTestingModule({
    imports: [PollutionReport],
    providers: [provideRouter([]), { provide: PollutionService, useValue: { create: () => response } }],
  });
  const fixture = TestBed.createComponent(PollutionReport);
  await fixture.whenStable();

  const form = fixture.debugElement.query(By.directive(PollutionForm));
  (form.componentInstance as PollutionForm).pollutionSubmitted.emit(newPollution);
  await fixture.whenStable();
  return fixture;
}

describe('PollutionReport', () => {
  it('shows the summary of the pollution saved by the API, with a link to edit it and a toast', async () => {
    const element = (await report(of({ ...newPollution, id: '42' }))).nativeElement as HTMLElement;

    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'success', message: 'La pollution a été déclarée.' }),
    ]);

    expect(element.querySelector('app-pollution-form')).toBeNull();
    expect(element.querySelector('app-report-summary h1')?.textContent).toContain('Décharge sauvage');
    expect(element.querySelector('app-report-summary .edit')?.getAttribute('href')).toBe('/pollutions/42/edit');
  });

  it('keeps the form with what was typed and shows an error toast when saving fails', async () => {
    const element = (await report(throwError(() => new Error('API unavailable')))).nativeElement as HTMLElement;

    expect(element.querySelector('app-report-summary')).toBeNull();
    expect(element.querySelector('app-pollution-form')).toBeTruthy();
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'error', message: expect.stringContaining('a échoué') }),
    ]);
  });
});
