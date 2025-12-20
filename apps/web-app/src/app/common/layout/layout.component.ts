import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { PwaUpdateToastComponent } from '../pwa-update-toast/pwa-update-toast.component';

@Component({
  imports: [RouterOutlet, NavbarComponent, FooterComponent, PwaUpdateToastComponent],
  selector: 'app-layout',
  template: `
    <div class="min-h-screen flex flex-col bg-base-100">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
      <app-pwa-update-toast />
    </div>
  `,
})
export class LayoutComponent {}
