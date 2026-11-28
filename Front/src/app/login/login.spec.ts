import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { AuthState } from '../store/auth.state';
import { Login } from './login';
import { LoginForm } from './login-form/login-form';

const alice: User = { id: 'abc', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Simulates a valid submission of the child form, then waits for the rendering
async function submit(response: Observable<User>, returnUrl?: string): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [Login],
    providers: [
      provideRouter([{ path: 'pollutions', children: [{ path: ':id', children: [] }] }]),
      { provide: UserService, useValue: { login: () => response } },
      provideStore([AuthState]),
    ],
  });
  const fixture = TestBed.createComponent(Login);
  // As the router does with the ?returnUrl=... query parameter (withComponentInputBinding)
  if (returnUrl) {
    fixture.componentRef.setInput('returnUrl', returnUrl);
  }
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

  it('dispatches Login with the profile of the user checked by the API', async () => {
    await submit(of(alice));
    const store = TestBed.inject(Store);

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.user)).toEqual({ id: 1, email: alice.email, name: 'Alice Dupont', role: 'user' });
  });

  it('goes back to the page the visitor asked for, when there is one', async () => {
    await submit(of(alice), '/pollutions/42');

    expect(TestBed.inject(Router).url).toBe('/pollutions/42');
  });

  it('keeps the form and shows the error when the credentials are wrong', async () => {
    const element = await submit(throwError(() => new Error('Login ou mot de passe incorrect.')));

    expect(TestBed.inject(Router).url).toBe('/');
    expect(TestBed.inject(Store).selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(element.querySelector('app-login-form')).toBeTruthy();
    expect(element.querySelector('.api-error')?.textContent).toContain('Login ou mot de passe incorrect.');
  });

  it('links to the signup page', async () => {
    const element = await submit(throwError(() => new Error('Erreur')));

    expect(element.querySelector('.switch a')?.getAttribute('href')).toBe('/signup');
  });
});
