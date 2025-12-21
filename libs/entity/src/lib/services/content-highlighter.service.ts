import { Injectable } from '@angular/core';
import Mark from 'mark.js';

@Injectable()
export class ContentHighlighterService {
  private markInstance: Mark | null = null;

  /**
   * Initialize or reinitialize the highlighter with a DOM element.
   */
  setContext(element: HTMLElement): void {
    this.markInstance = new Mark(element);
  }

  /**
   * Highlight all occurrences of the search term.
   */
  highlight(term: string): void {
    this.markInstance?.unmark();

    if (!term.trim()) {
      return;
    }

    this.markInstance?.mark(term, {
      separateWordSearch: false,
      caseSensitive: false,
      className: 'search-highlight',
      acrossElements: true,
    });
  }

  /**
   * Remove all highlights.
   */
  clear(): void {
    this.markInstance?.unmark();
  }
}
