import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { guestGuard } from './guest.guard';

@Component({ template: '' })
class Page {}

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

function setup(user: User | null): Router {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'login', canMatch: [guestGuard], component: Page },
        { path: 'pollutions', component: Page },
      ]),
      { provide: UserService, useValue: { user: signal(user) } },
    ],
  });
  return TestBed.inject(Router);
}

describe('guestGuard', () => {
  it('shows the login page to a visitor', async () => {
    const router = setup(null);

    await router.navigateByUrl('/login');

    expect(router.url).toBe('/login');
  });

  it('sends a logged-in user to the application instead of the login page', async () => {
    const router = setup(alice);

    await router.navigateByUrl('/login');

    expect(router.url).toBe('/pollutions');
  });
});
