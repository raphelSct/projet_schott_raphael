import { TestBed } from '@angular/core/testing';
import { ConfirmService } from './confirm.service';

const question = { title: 'Supprimer ?', message: 'Définitivement.', confirmLabel: 'Supprimer' };

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    service = TestBed.inject(ConfirmService);
  });

  it('exposes the question until it is answered, then resolves with the answer', async () => {
    const answer = service.ask(question);
    expect(service.request()).toEqual(question);

    service.answer(true);

    await expect(answer).resolves.toBe(true);
    expect(service.request()).toBeNull();
  });

  it('answers "no" to a question still open when a new one is asked', async () => {
    const first = service.ask(question);
    const second = service.ask({ ...question, title: 'Autre question ?' });

    await expect(first).resolves.toBe(false);
    service.answer(true);
    await expect(second).resolves.toBe(true);
  });
});
