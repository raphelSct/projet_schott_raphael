// Data sent to the API to create an account
export interface NewUser {
  username: string;
  password: string;
  lastName: string;
  firstName: string;
  email: string;
}

// User returned by the API: it gets an id,
// and the application never handles its password
export interface User extends Omit<NewUser, 'password'> {
  id: string;
}

// Data sent to the API to log in
export type Credentials = Pick<NewUser, 'username' | 'password'>;
