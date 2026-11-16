import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPollution } from '../../models/pollution';
import { PollutionForm } from './pollution-form';

const pollution: NewPollution = {
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
  severityIndex: 72,
  description: 'Sacs poubelle sur la berge',
  observationDate: '2026-10-01',
  location: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};

describe('PollutionForm', () => {
  let component: PollutionForm;
  let fixture: ComponentFixture<PollutionForm>;
  let emitted: NewPollution[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionForm);
    component = fixture.componentInstance;
    emitted = [];
    component.pollutionSubmitted.subscribe((p) => emitted.push(p));
  });

  it('emits nothing and shows the errors when the form is invalid', async () => {
    await fixture.whenStable();
    component.submit();

    expect(emitted).toEqual([]);
    expect(component.form.controls.title.touched).toBe(true);
  });

  it('emits the normalized pollution when the form is valid', async () => {
    await fixture.whenStable();
    component.form.setValue({ ...pollution, title: '  Décharge sauvage  ', photoUrl: '   ' });
    component.submit();

    expect(emitted).toEqual([{ ...pollution, photoUrl: undefined }]);
  });

  it('is prefilled with the initial value', async () => {
    fixture.componentRef.setInput('initialValue', pollution);
    await fixture.whenStable();

    expect(component.form.getRawValue()).toEqual({ ...pollution, photoUrl: '' });
  });

  describe('severity index', () => {
    // Errors of the severity index control once it holds the given value
    async function errorsFor(value: number | null) {
      await fixture.whenStable();
      const control = component.form.controls.severityIndex;
      control.setValue(value);
      return control.errors;
    }

    it('is required', async () => {
      expect(await errorsFor(null)).toEqual({ required: true });
    });

    it('accepts whole numbers from 0 to the maximum', async () => {
      expect(await errorsFor(0)).toBeNull();
      expect(await errorsFor(72)).toBeNull();
      expect(await errorsFor(component.maxSeverityIndex)).toBeNull();
    });

    it('refuses a negative number, a decimal and a number above the maximum', async () => {
      expect(await errorsFor(-1)).toHaveProperty('min');
      expect(await errorsFor(72.5)).toEqual({ integer: true });
      expect(await errorsFor(component.maxSeverityIndex + 1)).toHaveProperty('max');
    });

    it('shows the error under the field once it has been touched', async () => {
      await fixture.whenStable();
      const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#severityIndex')!;
      input.value = '-5';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain('compris entre 0 et 1000');
    });
  });

  it('shows the French label of each pollution type', async () => {
    await fixture.whenStable();
    const options = [...(fixture.nativeElement as HTMLElement).querySelectorAll('#type option')];

    expect(options.map((o) => o.textContent?.trim())).toContain('Dépôt sauvage');
    expect(options.map((o) => (o as HTMLOptionElement).value)).toContain('illegal-dumping');
  });
});
