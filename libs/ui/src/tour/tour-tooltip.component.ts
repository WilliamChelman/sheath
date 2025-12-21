import { I18nService } from '@/i18n';
import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroArrowRight,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { tourBundle } from './tour.i18n';
import { TourState, TourStep, TooltipPosition } from './tour.types';

/**
 * Tooltip component displaying tour step content and navigation controls.
 *
 * Positions itself relative to the highlighted element, choosing the
 * optimal position based on available viewport space.
 */
@Component({
  selector: 'app-tour-tooltip',
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroArrowLeft, heroArrowRight, heroXMark })],
  template: `
    <div
      class="fixed bg-base-100 rounded-lg shadow-xl p-4 max-w-sm z-[60] border border-base-300 transition-all duration-300"
      [style.left.px]="position().x"
      [style.top.px]="position().y"
    >
      <!-- Close button -->
      <button
        class="btn btn-ghost btn-circle btn-sm absolute top-2 right-2"
        (click)="close.emit()"
        [attr.aria-label]="t('close')"
      >
        <ng-icon name="heroXMark" class="text-lg" />
      </button>

      <!-- Content -->
      <h3 class="font-semibold text-lg pr-8 mb-2">{{ title() }}</h3>
      <p class="text-base-content/70 text-sm mb-4 whitespace-pre-line">
        {{ content() }}
      </p>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <!-- Step indicator -->
        @if (showStepIndicator()) {
          <span class="text-xs text-base-content/50">
            {{ t('stepIndicator', { current: currentStep(), total: totalSteps() }) }}
          </span>
        } @else {
          <span></span>
        }

        <!-- Buttons -->
        <div class="flex gap-2">
          @if (canGoPrevious()) {
            <button class="btn btn-sm btn-outline" (click)="previous.emit()">
              <ng-icon name="heroArrowLeft" class="text-sm" />
              {{ t('previous') }}
            </button>
          }

          @if (canGoNext()) {
            <button class="btn btn-primary btn-sm" (click)="next.emit()">
              {{ t('next') }}
              <ng-icon name="heroArrowRight" class="text-sm" />
            </button>
          } @else {
            <button class="btn btn-primary btn-sm" (click)="close.emit()">
              {{ t('finish') }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'contents',
  },
})
export class TourTooltipComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(tourBundle);

  /** Current step definition */
  step = input.required<TourStep>();

  /** Current tour state */
  state = input.required<TourState>();

  /** Target element's bounding rect, or null for centered positioning */
  targetRect = input<DOMRect | null>(null);

  /** Whether to show step indicator */
  showStepIndicator = input(true);

  /** Step title text */
  title = input.required<string>();

  /** Step content text */
  content = input.required<string>();

  /** Emitted when user clicks next */
  next = output<void>();

  /** Emitted when user clicks previous */
  previous = output<void>();

  /** Emitted when user clicks close or finish */
  close = output<void>();

  protected currentStep = computed(() => this.state().currentStepIndex + 1);
  protected totalSteps = computed(() => this.state().totalSteps);

  protected canGoNext = computed(
    () => this.state().currentStepIndex < this.state().totalSteps - 1
  );

  protected canGoPrevious = computed(() => this.state().currentStepIndex > 0);

  /** Calculate tooltip position based on target element and preferred position */
  protected position = computed(() => {
    const rect = this.targetRect();
    const step = this.step();
    const tooltipWidth = 320; // max-w-sm
    const tooltipHeight = 180; // approximate
    const margin = 16;
    const padding = 12; // Same as spotlight padding

    if (!rect) {
      // Center on screen for intro/outro steps
      return {
        x: (window.innerWidth - tooltipWidth) / 2,
        y: (window.innerHeight - tooltipHeight) / 2,
      };
    }

    const preferred = step.position ?? 'auto';
    return this.calculatePosition(
      rect,
      preferred,
      tooltipWidth,
      tooltipHeight,
      margin,
      padding
    );
  });

  private calculatePosition(
    rect: DOMRect,
    preferred: TooltipPosition,
    width: number,
    height: number,
    margin: number,
    padding: number
  ): { x: number; y: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate available space in each direction
    const spaceTop = rect.top - padding;
    const spaceBottom = vh - rect.bottom - padding;
    const spaceLeft = rect.left - padding;
    const spaceRight = vw - rect.right - padding;

    // Auto-select best position if not specified
    let position = preferred;
    if (position === 'auto') {
      const spaces = [
        { pos: 'right' as const, space: spaceRight },
        { pos: 'bottom' as const, space: spaceBottom },
        { pos: 'left' as const, space: spaceLeft },
        { pos: 'top' as const, space: spaceTop },
      ];
      spaces.sort((a, b) => b.space - a.space);
      position = spaces[0].pos;
    }

    let x: number;
    let y: number;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2 - width / 2;
        y = rect.top - padding - height - margin;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - width / 2;
        y = rect.bottom + padding + margin;
        break;
      case 'left':
        x = rect.left - padding - width - margin;
        y = rect.top + rect.height / 2 - height / 2;
        break;
      case 'right':
      default:
        x = rect.right + padding + margin;
        y = rect.top + rect.height / 2 - height / 2;
        break;
    }

    // Clamp to viewport
    x = Math.max(margin, Math.min(x, vw - width - margin));
    y = Math.max(margin, Math.min(y, vh - height - margin));

    return { x, y };
  }
}
