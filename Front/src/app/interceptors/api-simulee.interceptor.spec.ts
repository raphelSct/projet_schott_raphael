import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NouvelUtilisateur, Utilisateur } from '../models/utilisateur';
import { apiSimuleeInterceptor } from './api-simulee.interceptor';

const existants: Utilisateur[] = [
  { id: '1', login: 'adupont', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' },
];

const nouvelUtilisateur: NouvelUtilisateur = {
  login: 'cbernard',
  motDePasse: 'motdepasse',
  nom: 'Bernard',
  prenom: 'Chloé',
  email: 'chloe.bernard@example.com',
};

describe('apiSimuleeInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  const urlInscription = `${environment.apiUrl}/utilisateurs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiSimuleeInterceptor])), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("lit le fichier JSON et renvoie le nouvel utilisateur, sans son mot de passe", () => {
    let resultat: Utilisateur | undefined;

    client.post<Utilisateur>(urlInscription, nouvelUtilisateur).subscribe((u) => (resultat = u));

    const lecture = http.expectOne('mock-api/utilisateurs.json');
    expect(lecture.request.method).toBe('GET');
    lecture.flush(existants);

    expect(resultat).toEqual({
      id: expect.any(String),
      login: 'cbernard',
      nom: 'Bernard',
      prenom: 'Chloé',
      email: 'chloe.bernard@example.com',
    });
  });

  it('répond 409 si le login ou l\'email existe déjà dans le fichier', () => {
    let status: number | undefined;

    client
      .post<Utilisateur>(urlInscription, { ...nouvelUtilisateur, login: 'adupont' })
      .subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });
    http.expectOne('mock-api/utilisateurs.json').flush(existants);

    expect(status).toBe(409);
  });

  it('laisse passer les autres requêtes', () => {
    client.get('/autre').subscribe();

    http.expectOne('/autre').flush({});
  });
});
