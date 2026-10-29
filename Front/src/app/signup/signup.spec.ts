import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { NewUser, User } from '../models/user';
import { UserService } from '../services/user.service';
import { Signup } from './signup';
import { SignupForm } from './signup-form/signup-form';

const newUser: NewUser = {
  username: 'adupont',
  password: 'motdepasse',
  lastName: 'Dupont',
  firstName: 'Alice',
  email: 'alice.dupont@example.com',
};

// Simulates a valid submission of the child form, then waits for the rendering
async function submit(response: Observable<User>): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [Signup],
    providers: [
      provideRouter([{ path: 'pollutions', children: [] }]),
      { provide: UserService, useValue: { signUp: () => response } },
    ],
  });
  const fixture = TestBed.createComponent(Signup);
  await fixture.whenStable();

  const form = fixture.debugElement.query(By.directive(SignupForm));
  (form.componentInstance as SignupForm).userSubmitted.emit(newUser);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Signup', () => {
  it('opens the pollution list once the signup succeeds', async () => {
    await submit(of({ id: 'abc', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' }));

    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });

  it('keeps the form and shows the error when the API fails', async () => {
    const element = await submit(throwError(() => new Error('Ce login ou cet email est déjà utilisé.')));

    expect(TestBed.inject(Router).url).toBe('/');
    expect(element.querySelector('app-signup-form')).toBeTruthy();
    expect(element.querySelector('.api-error')?.textContent).toContain('déjà utilisé');
  });
});
