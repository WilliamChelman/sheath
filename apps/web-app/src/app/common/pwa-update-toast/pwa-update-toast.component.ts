import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPath } from '@ng-icons/heroicons/outline';
import { I18nService } from '@/i18n';
import { PwaUpdateService } from '../../services/pwa-update.service';
import { pwaUpdateToastBundle } from './pwa-update-toast.i18n';

@Component({
  selector: 'app-pwa-update-toast',
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroArrowPath })],
  template: `
    @if (pwaUpdate.updateAvailable()) {
      <div class="toast toast-end toast-bottom z-50">
        <div class="alert alert-info shadow-lg">
          <span>{{ t('message') }}</span>
          <button class="btn btn-sm btn-primary" (click)="reload()">
            <ng-icon name="heroArrowPath" class="text-lg" />
            {{ t('reloadButton') }}
          </button>
        </div>
      </div>
    }
  `,
})
export class PwaUpdateToastComponent {
  protected readonly pwaUpdate = inject(PwaUpdateService);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(pwaUpdateToastBundle);

  reload(): void {
    this.pwaUpdate.reloadApp();
  }
}
