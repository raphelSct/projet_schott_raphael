import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { User } from './models/user';
import { PollutionService } from './services/pollution.service';
import { UserService } from './services/user.service';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Creates the application with a signed-up user (or none), then opens the home page
async function openHome(user: User | null): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      { provide: UserService, useValue: { user: signal(user) } },
      { provide: PollutionService, useValue: { getAll: () => of([]) } },
    ],
  });
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl('/');
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('App', () => {
  it('redirects to the signup page while nobody has signed up', async () => {
    const compiled = await openHome(null);

    expect(compiled.querySelector('h1')?.textContent).toContain('Inscription');
    expect(compiled.querySelector('a[href="/pollutions/new"]')).toBeNull();
    expect(compiled.querySelector('app-user-profile')).toBeNull();
  });

  it('gives access to the pollution list and the profile once signed up', async () => {
    const compiled = await openHome(alice);

    expect(compiled.querySelector('h1')?.textContent).toContain('Pollutions déclarées');
    expect(compiled.querySelector('app-user-profile button')?.textContent).toContain('AD');
  });
});
