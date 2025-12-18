import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  selector: 'app-layout',
  template: `
    <div class="min-h-screen flex flex-col bg-base-100">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class LayoutComponent {}
