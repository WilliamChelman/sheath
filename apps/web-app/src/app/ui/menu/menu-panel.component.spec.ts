import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuPanelComponent } from './menu-panel.component';

@Component({
  imports: [MenuPanelComponent],
  template: `
    <app-menu-panel [size]="size" [width]="width">
      <li><button>Item 1</button></li>
      <li><button>Item 2</button></li>
    </app-menu-panel>
  `,
})
class TestHostComponent {
  size: 'sm' | 'md' | 'lg' = 'sm';
  width: string | null = null;
}

describe('MenuPanelComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    const panel = fixture.nativeElement.querySelector('app-menu-panel');
    expect(panel).toBeTruthy();
  });

  it('should apply DaisyUI menu classes', () => {
    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul.classList.contains('menu')).toBe(true);
    expect(ul.classList.contains('dropdown-content')).toBe(true);
    expect(ul.classList.contains('bg-base-100')).toBe(true);
    expect(ul.classList.contains('rounded-box')).toBe(true);
    expect(ul.classList.contains('shadow-lg')).toBe(true);
  });

  it('should apply menu-sm class by default', () => {
    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul.classList.contains('menu-sm')).toBe(true);
  });

  it('should apply different size classes', () => {
    host.size = 'lg';
    fixture.detectChanges();

    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul.classList.contains('menu-lg')).toBe(true);
    expect(ul.classList.contains('menu-sm')).toBe(false);
  });

  it('should apply default width when not specified', () => {
    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul.classList.contains('w-52')).toBe(true);
  });

  it('should apply custom width when specified', () => {
    host.width = '20rem';
    fixture.detectChanges();

    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul.classList.contains('w-52')).toBe(false);
    expect(ul.style.width).toBe('20rem');
  });

  it('should project content correctly', () => {
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Item 1');
    expect(items[1].textContent).toContain('Item 2');
  });
});

