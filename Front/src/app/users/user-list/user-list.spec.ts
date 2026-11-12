import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../../models/user';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { UserList } from './user-list';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };
const bruno: User = { id: '2', username: 'bmartin', lastName: 'Martin', firstName: 'Bruno', email: 'bruno.martin@example.com' };

// Opens the page as Alice, with fake answers from the API
async function showList(service: { getAll: () => Observable<User[]>; delete?: (id: string) => Observable<void> }): Promise<ComponentFixture<UserList>> {
  TestBed.configureTestingModule({
    imports: [UserList],
    providers: [
      { provide: UserService, useValue: { user: signal(alice), ...service } },
      // The user confirms in the dialog
      { provide: ConfirmService, useValue: { ask: () => Promise.resolve(true) } },
    ],
  });
  const fixture = TestBed.createComponent(UserList);
  await fixture.whenStable();
  return fixture;
}

const names = (element: HTMLElement) => [...element.querySelectorAll('.user .name')].map((n) => n.textContent?.replace(/\s+/g, ' ').trim());

describe('UserList', () => {

  it('shows the users returned by the API, without a delete button for the logged-in user', async () => {
    const element = (await showList({ getAll: () => of([alice, bruno]) })).nativeElement as HTMLElement;

    expect(names(element)).toEqual(['Alice Dupont (vous)', 'Bruno Martin']);
    expect(element.querySelector('.count')?.textContent).toContain('2 utilisateurs');
    expect(element.querySelectorAll('.user .delete')).toHaveLength(1);
  });

  it('shows a message when the API fails', async () => {
    const element = (await showList({ getAll: () => throwError(() => new Error('API unavailable')) })).nativeElement as HTMLElement;

    expect(element.querySelector('.api-error')).toBeTruthy();
    expect(element.querySelector('.users')).toBeNull();
  });

  it('removes the user from the list with a toast once the API confirms the deletion', async () => {
    const deleteSpy = vi.fn(() => of(undefined));
    const fixture = await showList({ getAll: () => of([alice, bruno]), delete: deleteSpy });
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('.user .delete')!.click();
    await fixture.whenStable();

    expect(deleteSpy).toHaveBeenCalledWith('2');
    expect(names(element)).toEqual(['Alice Dupont (vous)']);
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'success', message: 'Le compte de Bruno Martin a été supprimé.' }),
    ]);
  });

  it('keeps the list and shows an error toast when the deletion fails', async () => {
    const fixture = await showList({ getAll: () => of([alice, bruno]), delete: () => throwError(() => new Error('API unavailable')) });
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('.user .delete')!.click();
    await fixture.whenStable();

    expect(names(element)).toHaveLength(2);
    expect(TestBed.inject(ToastService).toasts()).toEqual([
      expect.objectContaining({ kind: 'error', message: expect.stringContaining('a échoué') }),
    ]);
  });
});
