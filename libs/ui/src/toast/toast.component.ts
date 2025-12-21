import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroExclamationCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { ToastService, type Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      heroCheckCircle,
      heroExclamationCircle,
      heroExclamationTriangle,
      heroInformationCircle,
      heroXMark,
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
            <ng-icon name="heroXMark" class="text-sm" />
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
        return 'heroCheckCircle';
      case 'error':
        return 'heroExclamationCircle';
      case 'warning':
        return 'heroExclamationTriangle';
      case 'info':
      default:
        return 'heroInformationCircle';
    }
  }
}
