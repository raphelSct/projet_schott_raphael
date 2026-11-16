import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { User } from '../models/user';
import { ConfirmService } from '../services/confirm.service';
import { UserService } from '../services/user.service';
import { unsavedChangesGuard } from './unsaved-changes.guard';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

// Runs the guard for a page that has (or not) unsaved changes; the user answers the dialog with "answer"
function leave(options: { unsaved: boolean; user?: User | null; answer?: boolean }) {
  const ask = vi.fn(() => Promise.resolve(options.answer ?? true));
  TestBed.configureTestingModule({
    providers: [
      { provide: UserService, useValue: { user: signal(options.user === undefined ? alice : options.user) } },
      { provide: ConfirmService, useValue: { ask } },
    ],
  });
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
    const { result, ask } = leave({ unsaved: true, user: null });

    expect(result).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });
});
