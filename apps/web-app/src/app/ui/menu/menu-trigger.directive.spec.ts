import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuPanelComponent } from './menu-panel.component';
import { MenuItemDirective } from './menu-item.directive';

@Component({
  imports: [MenuTriggerDirective, MenuPanelComponent, MenuItemDirective],
  template: `
    <button
      appMenuTrigger
      [appMenuTriggerFor]="menu"
      (opened)="onOpened()"
      (closed)="onClosed()"
    >
      Open Menu
    </button>
    <ng-template #menu>
      <app-menu-panel>
        <li><button appMenuItem>Item 1</button></li>
        <li><button appMenuItem>Item 2</button></li>
      </app-menu-panel>
    </ng-template>
  `,
})
class TestHostComponent {
  cdkTrigger = viewChild.required(CdkMenuTrigger);

  openedCount = 0;
  closedCount = 0;

  onOpened(): void {
    this.openedCount++;
  }

  onClosed(): void {
    this.closedCount++;
  }
}

describe('MenuTriggerDirective', () => {
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

  it('should create the directive', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should have proper ARIA attributes on trigger', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should provide access to CdkMenuTrigger', () => {
    expect(host.cdkTrigger()).toBeTruthy();
  });

  it('should open menu when clicking trigger', fakeAsync(() => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    tick();
    fixture.detectChanges();

    expect(host.openedCount).toBe(1);
    expect(host.cdkTrigger().isOpen()).toBe(true);
  }));

  it('should close menu when clicking trigger again', fakeAsync(() => {
    const button = fixture.nativeElement.querySelector('button');

    // Open
    button.click();
    tick();
    fixture.detectChanges();

    // Close
    button.click();
    tick();
    fixture.detectChanges();

    expect(host.closedCount).toBe(1);
    expect(host.cdkTrigger().isOpen()).toBe(false);
  }));

  it('should support programmatic toggle via CdkMenuTrigger', fakeAsync(() => {
    host.cdkTrigger().toggle();
    tick();
    fixture.detectChanges();

    expect(host.openedCount).toBe(1);
    expect(host.cdkTrigger().isOpen()).toBe(true);
  }));
});
