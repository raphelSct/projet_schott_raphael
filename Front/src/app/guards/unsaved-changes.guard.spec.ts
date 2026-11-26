import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { ConfirmService } from '../services/confirm.service';
import { Login } from '../store/auth.actions';
import { AuthState } from '../store/auth.state';
import { unsavedChangesGuard } from './unsaved-changes.guard';

// Runs the guard for a page that has (or not) unsaved changes; the user answers the dialog with "answer"
function leave(options: { unsaved: boolean; loggedIn?: boolean; answer?: boolean }) {
  const ask = vi.fn(() => Promise.resolve(options.answer ?? true));
  TestBed.configureTestingModule({
    providers: [
      provideStore([AuthState]),
      { provide: ConfirmService, useValue: { ask } },
    ],
  });
  if (options.loggedIn ?? true) {
    TestBed.inject(Store).dispatch(new Login({ email: 'alice.dupont@example.com', name: 'Alice Dupont' }));
  }
  const page = { hasUnsavedChanges: () => options.unsaved };
  const result = TestBed.runInInjectionContext(() => unsavedChangesGuard(page, {} as never, {} as never, {} as never));
  return { result, ask };
}

describe('unsavedChangesGuard', () => {
  it('lets the user leave a page without unsaved changes, without asking anything', () => {
    const { result, ask } = leave({ unsaved: false });

    expect(result).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });

  it('asks for confirmation when there are unsaved changes, and leaves if the user confirms', async () => {
    const { result, ask } = leave({ unsaved: true, answer: true });

    expect(ask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Quitter cette page ?' }));
    await expect(result).resolves.toBe(true);
  });

  it('stays on the page when the user cancels', async () => {
    const { result } = leave({ unsaved: true, answer: false });

    await expect(result).resolves.toBe(false);
  });

  it('does not ask anything once the user has logged out', () => {
    const { result, ask } = leave({ unsaved: true, loggedIn: false });

    expect(result).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });
});
