import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastService } from '../services/toast.service';
import { ToastContainer } from './toast-container';

describe('ToastContainer', () => {
  let fixture: ComponentFixture<ToastContainer>;
  let service: ToastService;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ToastContainer);
    service = TestBed.inject(ToastService);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('shows each toast, errors being announced right away', async () => {
    service.success('La pollution a été déclarée.');
    service.error('La suppression a échoué.');
    await fixture.whenStable();

    const toasts = [...element.querySelectorAll('.toast')];
    expect(toasts.map((t) => t.querySelector('.message')?.textContent)).toEqual([
      'La pollution a été déclarée.',
      'La suppression a échoué.',
    ]);
    expect(toasts.map((t) => t.getAttribute('role'))).toEqual(['status', 'alert']);
    expect(toasts[1].classList).toContain('error');
  });

  it('hides a toast with its close button', async () => {
    service.success('La pollution a été déclarée.');
    await fixture.whenStable();

    element.querySelector<HTMLButtonElement>('.toast .close')!.click();
    await fixture.whenStable();

    expect(element.querySelector('.toast')).toBeNull();
  });
});
