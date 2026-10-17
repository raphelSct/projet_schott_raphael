import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Utilisateur } from '../models/utilisateur';
import { ProfilUtilisateur } from './profil-utilisateur';

const alice: Utilisateur = { id: '1', login: 'adupont', nom: 'Dupont', prenom: 'Alice', email: 'alice.dupont@example.com' };

describe('ProfilUtilisateur', () => {
  let fixture: ComponentFixture<ProfilUtilisateur>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilUtilisateur],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilUtilisateur);
    fixture.componentRef.setInput('utilisateur', alice);
    element = fixture.nativeElement as HTMLElement;
    document.body.appendChild(element);
    await fixture.whenStable();
  });

  afterEach(() => element.remove());

  it("affiche les initiales, puis le récapitulatif au clic", async () => {
    const avatar = element.querySelector('button')!;
    expect(avatar.textContent).toContain('AD');
    expect(element.querySelector('.panneau')).toBeNull();

    avatar.click();
    await fixture.whenStable();

    expect(avatar.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('.panneau')?.textContent).toContain('alice.dupont@example.com');
  });

  it("se referme au clic en dehors", async () => {
    element.querySelector('button')!.click();
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(element.querySelector('.panneau')).toBeNull();
  });
});
