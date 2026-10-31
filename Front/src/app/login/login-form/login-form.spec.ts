import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Credentials } from '../../models/user';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;
  let emitted: Credentials[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    emitted = [];
    component.credentialsSubmitted.subscribe((c) => emitted.push(c));
    await fixture.whenStable();
  });

  it('emits nothing and shows the errors when a field is empty', async () => {
    component.submit();
    await fixture.whenStable();

    expect(emitted).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.error')).toHaveLength(2);
  });

  it('emits the credentials', () => {
    component.form.setValue({ username: 'adupont', password: 'motdepasse' });
    component.submit();

    expect(emitted).toEqual([{ username: 'adupont', password: 'motdepasse' }]);
  });
});
