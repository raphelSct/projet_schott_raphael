import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { authGuard } from './auth.guard';

@Component({ template: '' })
class Page {}

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Router with a protected area ("private"), a login page and the redirection of the home page, like the application
function setup(user: User | null): Router {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: '', pathMatch: 'full', redirectTo: 'private' },
        { path: 'login', component: Page },
        {
          path: 'private',
          canMatch: [authGuard],
          children: [
            { path: '', component: Page },
            { path: ':id', component: Page },
          ],
        },
      ]),
      { provide: UserService, useValue: { user: signal(user) } },
    ],
  });
  return TestBed.inject(Router);
}

describe('authGuard', () => {
  it('lets a logged-in user in', async () => {
    const router = setup(alice);

    await router.navigateByUrl('/private/42');

    expect(router.url).toBe('/private/42');
  });

  it('sends a visitor to the login page and keeps the page they asked for', async () => {
    const router = setup(null);

    await router.navigateByUrl('/private/42?tab=info');

    expect(router.url.startsWith('/login?returnUrl=')).toBe(true);
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/private/42?tab=info');
  });

  it('does not keep the home page, which is where the user lands anyway', async () => {
    const router = setup(null);

    await router.navigateByUrl('/');

    expect(router.url).toBe('/login');
  });
});
