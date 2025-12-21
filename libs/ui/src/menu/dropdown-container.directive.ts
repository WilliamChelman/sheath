import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

/**
 * Directive that applies DaisyUI dropdown container classes.
 * Apply this to the outer wrapper element to get dropdown positioning.
 *
 * @example
 * ```html
 * <div appDropdownContainer [align]="'end'">
 *   <button [appMenuTriggerFor]="menu">Open</button>
 *   <ng-template #menu>
 *     <app-menu-panel>...</app-menu-panel>
 *   </ng-template>
 * </div>
 * ```
 */
@Directive({
  selector: '[appDropdownContainer]',
  host: {
    class: 'dropdown',
  },
})
export class DropdownContainerDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  /**
   * Horizontal alignment of the dropdown panel.
   * - 'start' (default): aligns to the start edge
   * - 'end': aligns to the end edge (adds `dropdown-end`)
   */
  align = input<'start' | 'end'>('start');

  /**
   * Vertical position of the dropdown panel.
   * - 'bottom' (default): opens below the trigger
   * - 'top': opens above the trigger (adds `dropdown-top`)
   * - 'left': opens to the left of the trigger (adds `dropdown-left`)
   * - 'right': opens to the right of the trigger (adds `dropdown-right`)
   */
  position = input<'bottom' | 'top' | 'left' | 'right'>('bottom');

  /**
   * Whether the dropdown should open on hover instead of click.
   */
  hover = input(false);

  constructor() {
    effect(() => {
      const el = this.el.nativeElement;

      // Remove all position/alignment classes first
      this.renderer.removeClass(el, 'dropdown-end');
      this.renderer.removeClass(el, 'dropdown-top');
      this.renderer.removeClass(el, 'dropdown-left');
      this.renderer.removeClass(el, 'dropdown-right');
      this.renderer.removeClass(el, 'dropdown-hover');

      // Apply alignment
      if (this.align() === 'end') {
        this.renderer.addClass(el, 'dropdown-end');
      }

      // Apply position
      const pos = this.position();
      if (pos !== 'bottom') {
        this.renderer.addClass(el, `dropdown-${pos}`);
      }

      // Apply hover
      if (this.hover()) {
        this.renderer.addClass(el, 'dropdown-hover');
      }
    });
  }
}

