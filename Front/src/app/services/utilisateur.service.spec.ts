import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NouvelUtilisateur, Utilisateur } from '../models/utilisateur';
import { UtilisateurService } from './utilisateur.service';

const nouvelUtilisateur: NouvelUtilisateur = {
  login: 'adupont',
  motDePasse: 'motdepasse',
  nom: 'Dupont',
  prenom: 'Alice',
  email: 'alice.dupont@example.com',
};

describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UtilisateurService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Lance une inscription et renvoie le message d'erreur reçu après la réponse fournie
  function messageApres(status: number): string | undefined {
    let message: string | undefined;
    service.inscrire(nouvelUtilisateur).subscribe({ error: (e: Error) => (message = e.message) });
    http.expectOne(`${environment.apiUrl}/utilisateurs`).flush(null, { status, statusText: 'Erreur' });
    return message;
  }

  it("envoie l'inscription en POST à l'URL de l'environnement et garde l'utilisateur inscrit", () => {
    const reponse: Utilisateur = { id: 'abc', login: 'adupont', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' };
    let resultat: Utilisateur | undefined;

    service.inscrire(nouvelUtilisateur).subscribe((u) => (resultat = u));

    const requete = http.expectOne(`${environment.apiUrl}/utilisateurs`);
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual(nouvelUtilisateur);
    requete.flush(reponse);
    expect(resultat).toEqual(reponse);
    expect(service.utilisateur()).toEqual(reponse);
  });

  it("renvoie un message lisible quand l'API est injoignable", () => {
    let message: string | undefined;

    service.inscrire(nouvelUtilisateur).subscribe({ error: (e: Error) => (message = e.message) });

    http.expectOne(`${environment.apiUrl}/utilisateurs`).error(new ProgressEvent('error'), { status: 0 });
    expect(message).toContain("Impossible de joindre l'API");
    expect(service.utilisateur()).toBeNull();
  });

  it('signale un login ou un email déjà utilisé', () => {
    expect(messageApres(409)).toBe('Ce login ou cet email est déjà utilisé.');
  });
});
