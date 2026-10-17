import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewUser } from '../../models/user';
import { SignupForm } from './signup-form';

const input = {
  firstName: ' Alice ',
  lastName: 'Dupont',
  email: 'alice.dupont@example.com',
  username: 'adupont',
  password: 'motdepasse',
  passwordConfirmation: 'motdepasse',
};

describe('SignupForm', () => {
  let component: SignupForm;
  let fixture: ComponentFixture<SignupForm>;
  let emitted: NewUser[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupForm);
    component = fixture.componentInstance;
    emitted = [];
    component.userSubmitted.subscribe((u) => emitted.push(u));
    await fixture.whenStable();
  });

  it('emits nothing and shows the errors when the form is invalid', () => {
    component.submit();

    expect(emitted).toEqual([]);
    expect(component.form.controls.username.touched).toBe(true);
  });

  it('rejects two different passwords', () => {
    component.form.setValue({ ...input, passwordConfirmation: 'autrechose' });
    component.submit();

    expect(component.form.hasError('passwordsMismatch')).toBe(true);
    expect(emitted).toEqual([]);
  });

  it('emits the new user without the confirmation', () => {
    component.form.setValue(input);
    component.submit();

    expect(emitted).toEqual([
      { username: 'adupont', password: 'motdepasse', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' },
    ]);
  });
});
