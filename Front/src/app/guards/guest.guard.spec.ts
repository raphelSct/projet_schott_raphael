import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { Login } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';
import { guestGuard } from './guest.guard';

@Component({ template: '' })
class Page {}

const alice = { email: 'alice.dupont@example.com', name: 'Alice Dupont' };

function setup(user: typeof alice | null): Router {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'login', canMatch: [guestGuard], component: Page },
        { path: 'pollutions', component: Page },
      ]),
      provideStore([AuthState]),
    ],
  });
  if (user) {
    TestBed.inject(Store).dispatch(new Login(user));
  }
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
