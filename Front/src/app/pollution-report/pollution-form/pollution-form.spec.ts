import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPollution } from '../../models/pollution';
import { PollutionForm } from './pollution-form';

const pollution: NewPollution = {
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
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

  it('shows the French label of each pollution type', async () => {
    await fixture.whenStable();
    const options = [...(fixture.nativeElement as HTMLElement).querySelectorAll('#type option')];

    expect(options.map((o) => o.textContent?.trim())).toContain('Dépôt sauvage');
    expect(options.map((o) => (o as HTMLOptionElement).value)).toContain('illegal-dumping');
  });
});
