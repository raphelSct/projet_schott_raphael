import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService } from '../services/confirm.service';
import { ConfirmDialog } from './confirm-dialog';

const question = { title: 'Supprimer cette pollution ?', message: '« Décharge » sera supprimée.', confirmLabel: 'Supprimer' };

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let service: ConfirmService;
  let dialog: HTMLDialogElement;

  beforeAll(() => {
    // jsdom does not always implement modal dialogs: only the "open" state matters here
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
    };
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConfirmDialog);
    service = TestBed.inject(ConfirmService);
    await fixture.whenStable();
    dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  });

  // Asks the question, then waits for the dialog to open. The answer is wrapped in an object:
  // a promise returned as is by an async function would be awaited too, until the user answers
  async function ask(): Promise<{ answer: Promise<boolean> }> {
    const answer = service.ask(question);
    await fixture.whenStable();
    return { answer };
  }

  it('stays closed while no question is asked', () => {
    expect(dialog.open).toBe(false);
  });

  it('opens with the question, and closes with "yes" on the confirm button', async () => {
    const { answer } = await ask();

    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Supprimer cette pollution ?');
    expect(dialog.textContent).toContain('« Décharge » sera supprimée.');

    dialog.querySelector<HTMLButtonElement>('.confirm')!.click();
    await fixture.whenStable();

    await expect(answer).resolves.toBe(true);
    expect(dialog.open).toBe(false);
  });

  it('answers "no" on the cancel button', async () => {
    const { answer } = await ask();

    dialog.querySelector<HTMLButtonElement>('.cancel')!.click();

    await expect(answer).resolves.toBe(false);
  });

  it('answers "no" on Escape', async () => {
    const { answer } = await ask();

    dialog.querySelector('.cancel')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await expect(answer).resolves.toBe(false);
  });

  it('answers "no" when the browser closes the dialog itself', async () => {
    const { answer } = await ask();

    // On Escape, the browser closes the dialog and sends "close", but not always "cancel"
    dialog.dispatchEvent(new Event('close'));

    await expect(answer).resolves.toBe(false);
  });

  it('answers "no" on a click on the backdrop, but not on a click in the content', async () => {
    const { answer } = await ask();

    dialog.querySelector<HTMLElement>('.content')!.click();
    expect(service.request()).not.toBeNull();

    dialog.click();
    await expect(answer).resolves.toBe(false);
  });
});
