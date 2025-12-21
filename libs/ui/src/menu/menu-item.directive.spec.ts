import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemDirective } from './menu-item.directive';
import { CdkMenu } from '@angular/cdk/menu';

@Component({
  imports: [MenuItemDirective, CdkMenu],
  template: `
    <ul cdkMenu>
      <li>
        <button appMenuItem [active]="isActive">Test Item</button>
      </li>
      <li>
        <a appMenuItem href="#">Link Item</a>
      </li>
    </ul>
  `,
})
class TestHostComponent {
  isActive = false;
}

describe('MenuItemDirective', () => {
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

  it('should create menu items', () => {
    const items = fixture.nativeElement.querySelectorAll('[appMenuItem]');
    expect(items.length).toBe(2);
  });

  it('should apply active class when active is true', () => {
    const button = fixture.nativeElement.querySelector('button[appMenuItem]');
    expect(button.classList.contains('active')).toBe(false);

    host.isActive = true;
    fixture.detectChanges();

    expect(button.classList.contains('active')).toBe(true);
  });

  it('should work with anchor elements', () => {
    const anchor = fixture.nativeElement.querySelector('a[appMenuItem]');
    expect(anchor).toBeTruthy();
    expect(anchor.textContent).toContain('Link Item');
  });

  it('should set pointer cursor on items', () => {
    const button = fixture.nativeElement.querySelector('button[appMenuItem]');
    expect(button.style.cursor).toBe('pointer');
  });
});
