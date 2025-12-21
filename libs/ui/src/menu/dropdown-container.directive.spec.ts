import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownContainerDirective } from './dropdown-container.directive';

@Component({
  imports: [DropdownContainerDirective],
  template: `
    <div
      appDropdownContainer
      [align]="align"
      [position]="position"
      [hover]="hover"
    >
      <button>Trigger</button>
    </div>
  `,
})
class TestHostComponent {
  align: 'start' | 'end' = 'start';
  position: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  hover = false;
}

describe('DropdownContainerDirective', () => {
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

  it('should apply dropdown class by default', () => {
    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown')).toBe(true);
  });

  it('should not apply dropdown-end by default', () => {
    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-end')).toBe(false);
  });

  it('should apply dropdown-end when align is end', () => {
    host.align = 'end';
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-end')).toBe(true);
  });

  it('should apply dropdown-top when position is top', () => {
    host.position = 'top';
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-top')).toBe(true);
  });

  it('should apply dropdown-left when position is left', () => {
    host.position = 'left';
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-left')).toBe(true);
  });

  it('should apply dropdown-right when position is right', () => {
    host.position = 'right';
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-right')).toBe(true);
  });

  it('should apply dropdown-hover when hover is true', () => {
    host.hover = true;
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-hover')).toBe(true);
  });

  it('should remove classes when values change', () => {
    // Set initial values
    host.align = 'end';
    host.position = 'top';
    host.hover = true;
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[appDropdownContainer]');
    expect(container.classList.contains('dropdown-end')).toBe(true);
    expect(container.classList.contains('dropdown-top')).toBe(true);
    expect(container.classList.contains('dropdown-hover')).toBe(true);

    // Reset to defaults
    host.align = 'start';
    host.position = 'bottom';
    host.hover = false;
    fixture.detectChanges();

    expect(container.classList.contains('dropdown-end')).toBe(false);
    expect(container.classList.contains('dropdown-top')).toBe(false);
    expect(container.classList.contains('dropdown-hover')).toBe(false);
  });
});

