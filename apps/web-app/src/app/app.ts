import { ToastContainerComponent } from '@/ui/toast';
import { TourOverlayComponent } from '@/ui/tour';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './common/footer/footer.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { PwaUpdateToastComponent } from './common/pwa-update-toast/pwa-update-toast.component';

@Component({
  imports: [
    RouterOutlet,
    TourOverlayComponent,
    NavbarComponent,
    FooterComponent,
    PwaUpdateToastComponent,
    ToastContainerComponent,
  ],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-base-100">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-pwa-update-toast />
      <app-toast-container />
      <app-tour-overlay />
    </div>
  `,
})
export class App {}
