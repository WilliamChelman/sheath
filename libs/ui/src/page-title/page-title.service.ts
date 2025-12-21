import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

const APP_NAME = 'Sheath';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly title = inject(Title);

  /**
   * Sets the page title with the application name as suffix.
   * If the page title matches the app name or is empty, only the app name is shown.
   * @param pageTitle The page-specific title (e.g., "Home", "About")
   */
  setTitle(pageTitle: string): void {
    if (pageTitle && pageTitle !== APP_NAME) {
      this.title.setTitle(`${pageTitle} - ${APP_NAME}`);
    } else {
      this.title.setTitle(APP_NAME);
    }
  }
}
