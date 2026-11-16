import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { NewPollution, Pollution } from '../../models/pollution';
import { PollutionForm } from '../../pollution-report/pollution-form/pollution-form';
import { PollutionService } from '../../services/pollution.service';
import { ToastService } from '../../services/toast.service';
import { PollutionEdit } from './pollution-edit';

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

// Opens /pollutions/1/edit with fake answers from the API
async function showEdit(service: Partial<Record<keyof PollutionService, unknown>>): Promise<ComponentFixture<PollutionEdit>> {
  TestBed.configureTestingModule({
    imports: [PollutionEdit],
    providers: [provideRouter([{ path: 'pollutions/:id', children: [] }]), { provide: PollutionService, useValue: service }],
  });
  const fixture = TestBed.createComponent(PollutionEdit);
  fixture.componentRef.setInput('id', '1');
  await fixture.whenStable();
  return fixture;
}

// Submits the child form with the given values
async function submit(fixture: ComponentFixture<PollutionEdit>, values: NewPollution): Promise<void> {
  const form = fixture.debugElement.query(By.directive(PollutionForm));
  (form.componentInstance as PollutionForm).pollutionSubmitted.emit(values);
  await fixture.whenStable();
}

describe('PollutionEdit', () => {
  describe('unsaved changes', () => {
    // Types in a field of the real form, like the user does
    async function type(fixture: ComponentFixture<PollutionEdit>, value: string): Promise<void> {
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#title')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    it('has none right after the form is prefilled', async () => {
      const fixture = await showEdit({ getOne: () => of(pollution) });

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(false);
    });

    it('has some once the user has changed the form', async () => {
      const fixture = await showEdit({ getOne: () => of(pollution) });

      await type(fixture, 'Nouveau titre');

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    });

    it('has none once the changes are saved, so that going back to the detail page is not blocked', async () => {
      const fixture = await showEdit({ getOne: () => of(pollution), update: () => of(pollution) });
      await type(fixture, 'Nouveau titre');

      await submit(fixture, { ...pollution, title: 'Nouveau titre' });

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(false);
    });

    it('still has some when saving fails', async () => {
      const fixture = await showEdit({ getOne: () => of(pollution), update: () => throwError(() => new Error('API unavailable')) });
      await type(fixture, 'Nouveau titre');

      await submit(fixture, { ...pollution, title: 'Nouveau titre' });

      expect(fixture.componentInstance.hasUnsavedChanges()).toBe(true);
    });
  });

  it('shows the loading message while the pollution is unknown', async () => {
    const fixture = await showEdit({ getOne: () => NEVER });

    expect((fixture.nativeElement as HTMLElement).querySelector('.state-message')).toBeTruthy();
  });

  it('prefills the form with the current pollution', async () => {
    const fixture = await showEdit({ getOne: () => of(pollution) });

    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#title')?.value).toBe('Décharge sauvage');
  });

  it('saves with a PUT on the id, then goes back to the detail page with a toast', async () => {
    const updateSpy = vi.fn((): Observable<Pollution> => of({ ...pollution, title: 'Nouveau titre' }));
    const fixture = await showEdit({ getOne: () => of(pollution), update: updateSpy });

    await submit(fixture, { ...pollution, title: 'Nouveau titre' });

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Nouveau titre' }), '1');
    expect(TestBed.inject(Router).url).toBe('/pollutions/1');
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'success', message: 'Les modifications ont été enregistrées.' }),
    ]);
  });

  it('keeps the form and shows an error toast when saving fails', async () => {
    const fixture = await showEdit({
      getOne: () => of(pollution),
      update: () => throwError(() => new Error('API unavailable')),
    });

    await submit(fixture, pollution);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-pollution-form')).toBeTruthy();
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'error', message: expect.stringContaining("L'enregistrement des modifications a échoué") }),
    ]);
  });
});
