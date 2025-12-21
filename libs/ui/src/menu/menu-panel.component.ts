import { Component, input } from '@angular/core';
import { CdkMenu } from '@angular/cdk/menu';

/**
 * Menu panel component that wraps CdkMenu and applies DaisyUI dropdown/menu styling.
 * Use inside an `<ng-template>` referenced by `cdkMenuTriggerFor`.
 *
 * @example
 * ```html
 * <button [cdkMenuTriggerFor]="menu">Open</button>
 * <ng-template #menu>
 *   <app-menu-panel>
 *     <li><button cdkMenuItem>Option 1</button></li>
 *     <li><button cdkMenuItem>Option 2</button></li>
 *   </app-menu-panel>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'app-menu-panel',
  imports: [CdkMenu],
  template: `
    <ul
      cdkMenu
      class="menu dropdown-content bg-base-100 rounded-box z-50 p-2 shadow-lg"
      [class.menu-sm]="size() === 'sm'"
      [class.menu-md]="size() === 'md'"
      [class.menu-lg]="size() === 'lg'"
      [class.w-52]="!width()"
      [style.width]="width() || null"
    >
      <ng-content />
    </ul>
  `,
  host: {
    class: 'contents',
  },
})
export class MenuPanelComponent {
  /**
   * Size variant for the menu.
   * Maps to DaisyUI `menu-sm`, `menu-md`, `menu-lg`.
   */
  size = input<'sm' | 'md' | 'lg'>('sm');

  /**
   * Custom width for the menu panel.
   * If not provided, defaults to `w-52` (13rem).
   */
  width = input<string | null>(null);
}
