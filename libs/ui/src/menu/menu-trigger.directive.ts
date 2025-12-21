import { Directive } from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';

/**
 * Re-exports CdkMenuTrigger with DaisyUI-friendly defaults.
 * Use alongside DaisyUI dropdown classes for styling.
 *
 * @example
 * ```html
 * <div class="dropdown">
 *   <button [appMenuTriggerFor]="menu" appButton>Open Menu</button>
 *   <ng-template #menu>
 *     <app-menu-panel>
 *       <li><button appMenuItem>Item 1</button></li>
 *     </app-menu-panel>
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
