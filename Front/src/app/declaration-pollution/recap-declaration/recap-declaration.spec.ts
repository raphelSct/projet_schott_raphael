import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecapDeclaration } from './recap-declaration';

describe('RecapDeclaration', () => {
  let component: RecapDeclaration;
  let fixture: ComponentFixture<RecapDeclaration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecapDeclaration],
    }).compileComponents();

    fixture = TestBed.createComponent(RecapDeclaration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
