import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { AddFavorite } from './core/states/favorites/favorites.actions';
import { FavoritesState } from './core/states/favorites/favorites.state';
import { LoginForm } from './login/login-form/login-form';
import { By } from '@angular/platform-browser';
import { routes } from './app.routes';
import { User } from './models/user';
import { Pollution } from './models/pollution';
import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';
import { Login } from './store/auth.actions';
import { AuthState } from './store/auth.state';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Creates the application with a logged-in user (or none), then opens the home page
async function openHome(user: User | null, url = '/'): Promise<ComponentFixture<App>> {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes, withComponentInputBinding()),
      provideHttpClient(),
      provideStore([AuthState, FavoritesState]),
      { provide: UserService, useValue: { login: () => of(alice) } },
      { provide: PollutionService, useValue: { getAll: () => of([]), getOne: () => of(pollution) } },
    ],
  });
  if (user) {
    TestBed.inject(Store).dispatch(new Login({ email: user.email, name: `${user.firstName} ${user.lastName}` }));
  }
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl(url);
  await fixture.whenStable();
  return fixture;
}

const pollution: Pollution = {
  id: '42',
  title: 'Décharge sauvage',
  type: 'illegal-dumping',
  severityIndex: 72,
  description: 'Sacs poubelle sur la berge',
  observationDate: '2026-10-01',
  location: 'Paris',
  latitude: 48.8443,
  longitude: 2.3706,
};

describe('App', () => {
  it('keeps the page asked for while nobody is logged in, and opens it after the login', async () => {
    const fixture = await openHome(null, '/pollutions/42');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login?returnUrl=%2Fpollutions%2F42');

    const form = fixture.debugElement.query(By.directive(LoginForm));
    (form.componentInstance as LoginForm).credentialsSubmitted.emit({ username: 'adupont', password: 'motdepasse' });
    await fixture.whenStable();

    expect(router.url).toBe('/pollutions/42');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Décharge sauvage');
  });

  it('does not show the login page to a logged-in user', async () => {
    const compiled = (await openHome(alice, '/login')).nativeElement as HTMLElement;

    expect(TestBed.inject(Router).url).toBe('/pollutions');
    expect(compiled.querySelector('h1')?.textContent).toContain('Pollutions déclarées');
  });

  it('sends an unknown address to the pollution list', async () => {
    await openHome(alice, '/nowhere/to/be/found');

    expect(TestBed.inject(Router).url).toBe('/pollutions');
  });

  it('redirects to the login page while nobody is logged in', async () => {
    const compiled = (await openHome(null)).nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Connexion');
    expect(compiled.querySelector('a[href="/signup"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/pollutions/new"]')).toBeNull();
    expect(compiled.querySelector('app-user-profile')).toBeNull();
  });

  it('gives access to the pollutions, the users and the profile once logged in', async () => {
    const compiled = (await openHome(alice)).nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Pollutions déclarées');
    expect(compiled.querySelector('nav a[href="/users"]')).toBeTruthy();
    expect(compiled.querySelector('app-user-profile button')?.textContent).toContain('AD');
    expect(compiled.querySelector('.session .username')?.textContent).toBe('Alice Dupont');
  });

  it('shows the number of favorites next to the "Favoris" link, as it changes', async () => {
    const fixture = await openHome(alice);
    const badge = () => (fixture.nativeElement as HTMLElement).querySelector('nav a[href="/favorites"] .count')?.textContent;
    expect(badge()).toBe('0');

    TestBed.inject(Store).dispatch(new AddFavorite(pollution));
    await fixture.whenStable();

    expect(badge()).toBe('1');
  });

  it('opens the favorites page, also at the address given in the exercise', async () => {
    const fixture = await openHome(alice, '/favoris');

    expect(TestBed.inject(Router).url).toBe('/favorites');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toBe('Mes Favoris');
  });

  it('goes back to the login page after logging out', async () => {
    const fixture = await openHome(alice);
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('app-user-profile .avatar')!.click();
    await fixture.whenStable();
    compiled.querySelector<HTMLButtonElement>('app-user-profile .logout')!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(TestBed.inject(Store).selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(compiled.querySelector('app-user-profile')).toBeNull();
  });
});
