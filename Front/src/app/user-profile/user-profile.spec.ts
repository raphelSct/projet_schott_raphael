import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '../models/user';
import { UserProfile } from './user-profile';

const alice: User = { id: '1', username: 'adupont', lastName: 'Dupont', firstName: 'Alice', email: 'alice.dupont@example.com' };

describe('UserProfile', () => {
  let fixture: ComponentFixture<UserProfile>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    fixture.componentRef.setInput('user', alice);
    element = fixture.nativeElement as HTMLElement;
    document.body.appendChild(element);
    await fixture.whenStable();
  });

  afterEach(() => element.remove());

  it('shows the initials, then the profile summary on click', async () => {
    const avatar = element.querySelector('button')!;
    expect(avatar.textContent).toContain('AD');
    expect(element.querySelector('.panel')).toBeNull();

    avatar.click();
    await fixture.whenStable();

    expect(avatar.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.panel')?.textContent).toContain('alice.dupont@example.com');
  });

  it('asks the parent to log out', async () => {
    const logoutSpy = vi.fn();
    fixture.componentInstance.logout.subscribe(logoutSpy);

    element.querySelector('button')!.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.logout')!.click();

    expect(logoutSpy).toHaveBeenCalled();
  });

  it('closes on a click outside', async () => {
    element.querySelector('button')!.click();
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(element.querySelector('.panel')).toBeNull();
  });
});
