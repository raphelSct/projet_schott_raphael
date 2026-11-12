import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NewUser, User } from '../models/user';
import { UserService } from './user.service';

const newUser: NewUser = {
  username: 'adupont',
  password: 'motdepasse',
  lastName: 'Dupont',
  firstName: 'Alice',
  email: 'alice.dupont@example.com',
};
const alice: User = { id: 'abc', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Starts a signup and returns the error message received after the given response
  function signUpMessageAfter(status: number, body: object | null = null): string | undefined {
    let message: string | undefined;
    service.signUp(newUser).subscribe({ error: (e: Error) => (message = e.message) });
    http.expectOne(url).flush(body, { status, statusText: 'Error' });
    return message;
  }

  describe('signUp', () => {
    it('sends the signup as a POST to the environment URL and keeps the signed-up user', () => {
      let result: User | undefined;

      service.signUp(newUser).subscribe((u) => (result = u));

      const request = http.expectOne(url);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(newUser);
      request.flush(alice);
      expect(result).toEqual(alice);
      expect(service.user()).toEqual(alice);
    });

    it('returns a readable message when the API cannot be reached', () => {
      let message: string | undefined;

      service.signUp(newUser).subscribe({ error: (e: Error) => (message = e.message) });

      http.expectOne(url).error(new ProgressEvent('error'), { status: 0 });
      expect(message).toContain("Impossible de joindre l'API");
      expect(service.user()).toBeNull();
    });

    it('reports a username or email already in use', () => {
      expect(signUpMessageAfter(409)).toBe('Ce login ou cet email est déjà utilisé.');
    });

    it("shows the API's explanation for invalid data", () => {
      expect(signUpMessageAfter(400, { message: "Le format de l'email est invalide." })).toBe("Le format de l'email est invalide.");
    });
  });

  describe('login and logout', () => {
    it('logs in with a POST of the credentials and keeps the user', () => {
      service.login({ username: 'adupont', password: 'motdepasse' }).subscribe();

      const request = http.expectOne(`${url}/login`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({ username: 'adupont', password: 'motdepasse' });
      request.flush(alice);
      expect(service.user()).toEqual(alice);
    });

    it('reports wrong credentials', () => {
      let message: string | undefined;

      service.login({ username: 'adupont', password: 'mauvais' }).subscribe({ error: (e: Error) => (message = e.message) });
      http.expectOne(`${url}/login`).flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(message).toBe('Login ou mot de passe incorrect.');
      expect(service.user()).toBeNull();
    });

    it('forgets the user on logout', () => {
      service.login({ username: 'adupont', password: 'motdepasse' }).subscribe();
      http.expectOne(`${url}/login`).flush(alice);

      service.logout();

      expect(service.user()).toBeNull();
    });
  });

  it('gets the list of users with a GET', () => {
    let result: User[] | undefined;

    service.getAll().subscribe((u) => (result = u));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([alice]);
    expect(result).toEqual([alice]);
  });

  it('deletes a user with a DELETE on its id', () => {
    service.delete('abc').subscribe();

    expect(http.expectOne(`${url}/abc`).request.method).toBe('DELETE');
  });
});
