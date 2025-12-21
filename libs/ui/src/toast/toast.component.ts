import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheckCircle,
  phosphorXCircle,
  phosphorWarning,
  phosphorInfo,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { ToastService, type Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      phosphorCheckCircle,
      phosphorXCircle,
      phosphorWarning,
      phosphorInfo,
      phosphorX,
    }),
  ],
  template: `
    <div class="toast toast-end toast-bottom z-50">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="alert shadow-lg"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-error]="toast.type === 'error'"
          [class.alert-info]="toast.type === 'info'"
          [class.alert-warning]="toast.type === 'warning'"
        >
          <ng-icon [name]="getIcon(toast.type)" class="text-lg" />
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            (click)="toastService.dismiss(toast.id)"
          >
            <ng-icon name="phosphorX" class="text-sm" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'phosphorCheckCircle';
      case 'error':
        return 'phosphorXCircle';
      case 'warning':
        return 'phosphorWarning';
      case 'info':
      default:
        return 'phosphorInfo';
    }
  }
}
