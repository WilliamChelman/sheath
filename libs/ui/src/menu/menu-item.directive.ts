import { Directive, input } from '@angular/core';
import { CdkMenuItem } from '@angular/cdk/menu';

/**
 * Directive that composes CdkMenuItem with DaisyUI menu item styling.
 * Can be applied to `<button>`, `<a>`, or other interactive elements within a menu.
 *
 * @example
 * ```html
 * <app-menu-panel>
 *   <li><button appMenuItem>Action 1</button></li>
 *   <li><a appMenuItem href="/route">Link Item</a></li>
 *   <li><button appMenuItem [active]="true">Active Item</button></li>
 * </app-menu-panel>
 * ```
 *
 * Note: You can also use CdkMenuItem directly from '@angular/cdk/menu'.
 */
@Directive({
  selector: '[appMenuItem]',
  hostDirectives: [CdkMenuItem],
  host: {
    '[class.active]': 'active()',
    '[style.cursor]': '"pointer"',
  },
})
export class MenuItemDirective {
  /**
   * Whether this menu item is in an active/selected state.
   * Adds the DaisyUI `active` class.
   */
  active = input(false);
}
