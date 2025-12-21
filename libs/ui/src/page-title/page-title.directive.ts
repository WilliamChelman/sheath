import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { PageTitleService } from './page-title.service';

@Directive({
  selector: '[appPageTitle]',
  standalone: true,
})
export class PageTitleDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly pageTitleService = inject(PageTitleService);
  private observer: MutationObserver | null = null;

  ngAfterViewInit(): void {
    this.updateTitle();

    this.observer = new MutationObserver(() => this.updateTitle());
    this.observer.observe(this.elementRef.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private updateTitle(): void {
    const textContent = this.elementRef.nativeElement.textContent?.trim() ?? '';
    this.pageTitleService.setTitle(textContent);
  }
}
