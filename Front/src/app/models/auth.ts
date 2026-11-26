// Logged-in user kept in the store. The profile is simulated (the next session will bring a token):
// the name is the one given at login, the id and the role are made up.
export interface UserProfile {
  id: number;
  email: string;
  name: string; // "nom" in the exercise: the code is written in English
  role: string;
}

export interface AuthStateModel {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
