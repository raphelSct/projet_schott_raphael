import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AuthStateModel, UserProfile } from '../models/auth';
import { Login, Logout } from './auth.actions';

const defaults: AuthStateModel = { user: null, isAuthenticated: false };

// Who is logged in. Saved in localStorage by the storage plugin (see app.config.ts), so it survives a page reload.
@State<AuthStateModel>({ name: 'auth', defaults })
@Injectable()
export class AuthState {
  @Selector()
  static user(state: AuthStateModel): UserProfile | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  // Name to display for the logged-in user
  @Selector()
  static username(state: AuthStateModel): string | null {
    return state.user?.name ?? null;
  }

  @Action(Login)
  login(context: StateContext<AuthStateModel>, { payload }: Login): void {
    context.patchState({ user: { id: 1, ...payload, role: 'user' }, isAuthenticated: true });
  }

  @Action(Logout)
  logout(context: StateContext<AuthStateModel>): void {
    context.setState(defaults);
  }
}
