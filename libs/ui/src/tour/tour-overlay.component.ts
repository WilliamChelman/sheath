import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { TourSpotlightComponent } from './tour-spotlight.component';
import { TourTooltipComponent } from './tour-tooltip.component';
import { TourService } from './tour.service';

/**
 * Main tour overlay component.
 *
 * Renders the spotlight and tooltip when a tour is active.
 * Handles keyboard navigation and element positioning.
 */
@Component({
  selector: 'app-tour-overlay',
  imports: [TourSpotlightComponent, TourTooltipComponent],
  template: `
    @if (tourService.isActive()) {
      <!-- Clickable backdrop to close tour -->
      <div
        class="fixed inset-0 z-50"
        (click)="onBackdropClick($event)"
        (keydown.escape)="tourService.close()"
        tabindex="-1"
      >
        <!-- Spotlight overlay -->
        <app-tour-spotlight [targetRect]="targetRect()" />

        <!-- Tooltip -->
        @if (tourService.state(); as state) {
          @if (tourService.currentStep(); as step) {
            <app-tour-tooltip
              [step]="step"
              [state]="state"
              [targetRect]="targetRect()"
              [showStepIndicator]="showStepIndicator()"
              [title]="stepTitle()"
              [content]="stepContent()"
              (next)="tourService.next()"
              (previous)="tourService.previous()"
              (closeTour)="tourService.close()"
            />
          }
        }
      </div>
    }
  `,
  host: {
    class: 'contents',
  },
})
export class TourOverlayComponent {
  protected readonly tourService = inject(TourService);
  private readonly i18n = inject(I18nService);

  /** Signal to force position recalculation */
  private readonly positionTick = signal(0);

  /** Target element's bounding rect */
  protected readonly targetRect = computed(() => {
    // Subscribe to position tick for reactivity
    this.positionTick();

    const step = this.tourService.currentStep();
    if (!step || step.target === 'none') return null;

    const element = document.querySelector(step.target);
    return element?.getBoundingClientRect() ?? null;
  });

  /** Whether to show step indicator */
  protected readonly showStepIndicator = computed(() => {
    const tour = this.tourService.activeTour();
    return tour?.showStepIndicator ?? true;
  });

  /** Translated step title */
  protected readonly stepTitle = computed(() => {
    const step = this.tourService.currentStep();
    const tour = this.tourService.activeTour();
    if (!step || !tour) return '';
    return this.translateStepKey(tour.bundle, step.titleKey);
  });

  /** Translated step content */
  protected readonly stepContent = computed(() => {
    const step = this.tourService.currentStep();
    const tour = this.tourService.activeTour();
    if (!step || !tour) return '';
    return this.translateStepKey(tour.bundle, step.contentKey);
  });

  constructor() {
    // Scroll target element into view when step changes
    effect(() => {
      const step = this.tourService.currentStep();
      if (!step || step.target === 'none') return;

      // Small delay to let Angular render
      setTimeout(() => {
        const element = document.querySelector(step.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Force position recalculation after scroll
          setTimeout(() => this.positionTick.update((v) => v + 1), 400);
        }
      }, 50);
    });

    // Update positions on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.positionTick.update((v) => v + 1);
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.tourService.isActive()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.tourService.close();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.tourService.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.tourService.previous();
        break;
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Only close if clicking directly on the backdrop, not on tooltip
    if (event.target === event.currentTarget) {
      this.tourService.close();
    }
  }

  /**
   * Translate a step key using the tour's bundle.
   *
   * Supports nested keys like "intro.title" or "batchMode.content".
   */
  private translateStepKey(bundle: unknown, key: string): string {
    const t = this.i18n.useBundleT(bundle as Parameters<typeof this.i18n.useBundleT>[0]);

    // Parse nested key path (e.g., "intro.title" -> ["intro", "title"])
    const parts = key.split('.');

    // For simple keys, use directly
    if (parts.length === 1) {
      return t(key as never);
    }

    // For nested keys, build the path
    // The i18n system expects dot notation, so we pass the full key
    return t(key as never);
  }
}
