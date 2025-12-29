import { ToastContainerComponent } from '@/ui/toast';
import { TourOverlayComponent } from '@/ui/tour';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from './common/language-switcher/language-switcher.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { ThemeSwitchComponent } from './common/theme-switch/theme-switch.component';

const SIDEBAR_COLLAPSED_KEY = 'sheath.sidebar.collapsed';

function readCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistCollapsedState(collapsed: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  } catch {
    // ignore storage failures
  }
}

@Component({
  imports: [
    RouterOutlet,
    TourOverlayComponent,
    SidebarComponent,
    ThemeSwitchComponent,
    LanguageSwitcherComponent,
    ToastContainerComponent,
  ],
  selector: 'app-root',
  template: `
    <div class="flex h-screen bg-base-100 overflow-hidden">
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="toggleSidebar()">
        <div
          class="flex items-center gap-1"
          [class.justify-center]="sidebarCollapsed()"
        >
          <app-theme-switch />
          @if (!sidebarCollapsed()) {
            <app-language-switcher />
          }
        </div>
      </app-sidebar>
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
      <app-toast-container />
    </div>
    <app-tour-overlay />
  `,
})
export class App {
  protected readonly sidebarCollapsed = signal(readCollapsedState());

  protected toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    persistCollapsedState(next);
  }
}
