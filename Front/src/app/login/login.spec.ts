import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { Login } from './login';
import { LoginForm } from './login-form/login-form';

const alice: User = { id: 'abc', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Simulates a valid submission of the child form, then waits for the rendering
async function submit(response: Observable<User>): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [Login],
    providers: [
      provideRouter([{ path: 'pollutions', children: [] }]),
      { provide: UserService, useValue: { login: () => response } },
    ],
  });
  const fixture = TestBed.createComponent(Login);
  await fixture.whenStable();

  const form = fixture.debugElement.query(By.directive(LoginForm));
  (form.componentInstance as LoginForm).credentialsSubmitted.emit({ username: 'adupont', password: 'motdepasse' });
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Login', () => {
  it('opens the pollution list once logged in', async () => {
    await submit(of(alice));

    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });

  it('keeps the form and shows the error when the credentials are wrong', async () => {
    const element = await submit(throwError(() => new Error('Login ou mot de passe incorrect.')));

    expect(TestBed.inject(Router).url).toBe('/');
    expect(element.querySelector('app-login-form')).toBeTruthy();
    expect(element.querySelector('.api-error')?.textContent).toContain('Login ou mot de passe incorrect.');
  });

  it('links to the signup page', async () => {
    const element = await submit(throwError(() => new Error('Erreur')));

    expect(element.querySelector('.switch a')?.getAttribute('href')).toBe('/signup');
  });
});
