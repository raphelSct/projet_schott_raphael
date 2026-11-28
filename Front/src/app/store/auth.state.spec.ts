import { TestBed } from '@angular/core/testing';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { Store, provideStore } from '@ngxs/store';
import { Login, Logout } from './auth.actions';
import { AuthState } from './auth.state';

const alice = { email: 'alice.dupont@example.com', name: 'Alice Dupont' };
const storedAlice = { id: 1, ...alice, role: 'user' };

// The store configured like in app.config.ts, persistence included
function createStore(): Store {
  TestBed.configureTestingModule({
    providers: [provideStore([AuthState], withNgxsStoragePlugin({ keys: ['auth'] }))],
  });
  return TestBed.inject(Store);
}

describe('AuthState', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts logged out', () => {
    const store = createStore();

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
    expect(store.selectSnapshot(AuthState.username)).toBeNull();
  });

  it('gives each action its explicit type', () => {
    expect(Login.type).toBe('[Auth] Login');
    expect(Logout.type).toBe('[Auth] Logout');
  });

  it('keeps a simulated profile on Login', () => {
    const store = createStore();

    store.dispatch(new Login(alice));

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.user)).toEqual(storedAlice);
    expect(store.selectSnapshot(AuthState.username)).toBe('Alice Dupont');
  });

  it('goes back to the initial state on Logout', () => {
    const store = createStore();
    store.dispatch(new Login(alice));

    store.dispatch(new Logout());

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
  });

  it('saves the state in localStorage, under the "auth" key', () => {
    const store = createStore();

    store.dispatch(new Login(alice));
    expect(JSON.parse(localStorage.getItem('auth')!)).toEqual({ user: storedAlice, isAuthenticated: true });

    store.dispatch(new Logout());
    expect(JSON.parse(localStorage.getItem('auth')!)).toEqual({ user: null, isAuthenticated: false });
  });

  it('restores the state saved by a previous visit, as after a page reload', () => {
    localStorage.setItem('auth', JSON.stringify({ user: storedAlice, isAuthenticated: true }));

    const store = createStore();

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.username)).toBe('Alice Dupont');
  });
});
