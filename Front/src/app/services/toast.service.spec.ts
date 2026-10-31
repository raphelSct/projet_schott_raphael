import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('stacks the toasts in the order they were shown', () => {
    service.success('Enregistré.');
    service.error('Échec.');

    expect(service.toasts().map(({ kind, message }) => ({ kind, message }))).toEqual([
      { kind: 'success', message: 'Enregistré.' },
      { kind: 'error', message: 'Échec.' },
    ]);
  });

  it('hides a success after 4 seconds, an error after 8 seconds', () => {
    service.success('Enregistré.');
    service.error('Échec.');

    vi.advanceTimersByTime(4000);
    expect(service.toasts().map((t) => t.kind)).toEqual(['error']);

    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toEqual([]);
  });

  it('hides a toast as soon as it is dismissed', () => {
    service.success('Enregistré.');

    service.dismiss(service.toasts()[0].id);

    expect(service.toasts()).toEqual([]);
  });
});
