import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NewPollution, Pollution } from '../models/pollution';
import { mockPollutionsInterceptor } from './mock-pollutions.interceptor';

const STORAGE_KEY = 'mock-api.pollutions';

const initialData: Pollution[] = [
  {
    id: '1',
    title: 'Décharge sauvage',
    type: 'illegal-dumping',
    description: 'Sacs poubelle sur la berge',
    observationDate: '2026-10-01',
    location: 'Paris',
    latitude: 48.8443,
    longitude: 2.3706,
  },
  {
    id: '2',
    title: 'Mousse sur le canal',
    type: 'water',
    description: 'Mousse blanchâtre',
    observationDate: '2026-09-22',
    location: 'Paris',
    latitude: 48.8721,
    longitude: 2.3658,
  },
];

const newPollution: NewPollution = {
  title: 'Huile dans le caniveau',
  type: 'chemical',
  description: "Traînée d'huile",
  observationDate: '2026-10-12',
  location: 'Lyon',
  latitude: 45.7578,
  longitude: 4.8661,
};

describe('mockPollutionsInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  const pollutionsUrl = `${environment.apiUrl}/pollutions`;

  // Pollutions currently "in the database"
  const stored = (): Pollution[] => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockPollutionsInterceptor])), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  describe('GET /pollutions', () => {
    it('returns the initial data from the JSON file while nothing is saved', () => {
      let result: Pollution[] | undefined;

      client.get<Pollution[]>(pollutionsUrl).subscribe((p) => (result = p));
      http.expectOne('mock-api/pollutions.json').flush(initialData);

      expect(result).toEqual(initialData);
    });

    it('returns the pollutions saved in localStorage, without reading the file again', () => {
      const saved = [{ ...initialData[0], title: 'Titre modifié' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      let result: Pollution[] | undefined;

      client.get<Pollution[]>(pollutionsUrl).subscribe((p) => (result = p));

      http.expectNone('mock-api/pollutions.json');
      expect(result).toEqual(saved);
    });
  });

  // The following tests start from saved data, so the JSON file is never read
  describe('with saved pollutions', () => {
    beforeEach(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData)));

    it('GET /pollutions/:id returns the pollution', () => {
      let result: Pollution | undefined;

      client.get<Pollution>(`${pollutionsUrl}/2`).subscribe((p) => (result = p));

      expect(result).toEqual(initialData[1]);
    });

    it('GET /pollutions/:id responds 404 for an unknown id', () => {
      let status: number | undefined;

      client.get(`${pollutionsUrl}/99`).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });

      expect(status).toBe(404);
    });

    it('POST /pollutions creates the pollution with a new id and saves it', () => {
      let response: HttpResponse<Pollution> | undefined;

      client.post<Pollution>(pollutionsUrl, newPollution, { observe: 'response' }).subscribe((r) => (response = r));

      expect(response?.status).toBe(201);
      expect(response?.body).toEqual({ ...newPollution, id: expect.any(String) });
      expect(stored()).toEqual([...initialData, response?.body]);
    });

    it('PUT /pollutions/:id replaces the pollution and keeps the id from the URL', () => {
      let result: Pollution | undefined;

      client.put<Pollution>(`${pollutionsUrl}/1`, { ...newPollution, id: 'other' }).subscribe((p) => (result = p));

      expect(result).toEqual({ ...newPollution, id: '1' });
      expect(stored()).toEqual([{ ...newPollution, id: '1' }, initialData[1]]);
    });

    it('PUT /pollutions/:id responds 404 for an unknown id, without saving anything', () => {
      let status: number | undefined;

      client.put(`${pollutionsUrl}/99`, newPollution).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });

      expect(status).toBe(404);
      expect(stored()).toEqual(initialData);
    });

    it('DELETE /pollutions/:id removes the pollution and responds 204', () => {
      let status: number | undefined;

      client.delete(`${pollutionsUrl}/1`, { observe: 'response' }).subscribe((r) => (status = r.status));

      expect(status).toBe(204);
      expect(stored()).toEqual([initialData[1]]);
    });

    it('DELETE /pollutions/:id responds 404 for an unknown id', () => {
      let status: number | undefined;

      client.delete(`${pollutionsUrl}/99`).subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });

      expect(status).toBe(404);
      expect(stored()).toEqual(initialData);
    });
  });

  it('lets other requests through', () => {
    client.get('/other').subscribe();
    client.get(`${pollutionsUrl}/1/extra`).subscribe();

    http.expectOne('/other').flush({});
    http.expectOne(`${pollutionsUrl}/1/extra`).flush({});
  });
});
