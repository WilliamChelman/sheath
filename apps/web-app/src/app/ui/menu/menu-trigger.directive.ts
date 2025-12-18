import { Directive } from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';

/**
 * Re-exports CdkMenuTrigger with DaisyUI-friendly defaults.
 * Use alongside DaisyUI dropdown classes for styling.
 *
 * @example
 * ```html
 * <div class="dropdown">
 *   <button [cdkMenuTriggerFor]="menu" class="btn">Open Menu</button>
 *   <ng-template #menu>
 *     <ul cdkMenu class="menu dropdown-content">
 *       <li><button cdkMenuItem>Item 1</button></li>
 *     </ul>
 *   </ng-template>
 * </div>
 * ```
 *
 * Note: This directive is provided for convenience. You can also use
 * CdkMenuTrigger directly from '@angular/cdk/menu'.
 */
@Directive({
  selector: '[appMenuTrigger]',
  exportAs: 'appMenuTrigger',
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: appMenuTriggerFor'],
      outputs: ['cdkMenuOpened: opened', 'cdkMenuClosed: closed'],
    },
  ],
  host: {
    '[attr.aria-haspopup]': '"menu"',
  },
})
export class MenuTriggerDirective {}
