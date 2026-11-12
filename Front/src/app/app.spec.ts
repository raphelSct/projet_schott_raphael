import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { User } from './models/user';
import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Creates the application with a logged-in user (or none), then opens the home page
async function openHome(user: User | null): Promise<ComponentFixture<App>> {
  const currentUser = signal(user);
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      { provide: UserService, useValue: { user: currentUser, logout: () => currentUser.set(null) } },
      { provide: PollutionService, useValue: { getAll: () => of([]) } },
    ],
  });
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl('/');
  await fixture.whenStable();
  return fixture;
}

describe('App', () => {
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
  });

  it('goes back to the login page after logging out', async () => {
    const fixture = await openHome(alice);
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('app-user-profile .avatar')!.click();
    await fixture.whenStable();
    compiled.querySelector<HTMLButtonElement>('app-user-profile .logout')!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(compiled.querySelector('app-user-profile')).toBeNull();
  });
});
