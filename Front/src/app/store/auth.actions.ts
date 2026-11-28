// The only ways to change the authentication state

export class Login {
  static readonly type = '[Auth] Login';

  constructor(readonly payload: { email: string; name: string }) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}
