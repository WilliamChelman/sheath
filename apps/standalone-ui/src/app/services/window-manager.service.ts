import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

@Injectable({ providedIn: 'root' })
export class WindowManagerService {
  // listen to shift+click events on links and open in new window
  init(): void {
    document.addEventListener('click', (event) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (event.shiftKey && anchor) {
        event.preventDefault();
        const url = anchor.href;
        this.openInNewWindow(url);
      }
    });
  }

  openInNewWindow(url: string): void {
    const label = Math.random().toString(36).substring(2, 15);
    const webviewWindow = new WebviewWindow(label, { url });
    webviewWindow.once('tauri://created', function () {
      console.log('webview window successfully created');
    });
    webviewWindow.once('tauri://error', function (e) {
      throw new Error(`Failed to create webview window: ${e.payload}`);
    });
  }
}

export function provideWindowManager(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const windowManagerService = inject(WindowManagerService);
      windowManagerService.init();
    }),
  ]);
}
