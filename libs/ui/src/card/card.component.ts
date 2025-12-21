import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type CardVariant = 'solid' | 'soft';

@Component({
  selector: 'app-card',
  imports: [NgClass],
  template: `
    <div class="card" [ngClass]="cardClasses()">
      <div class="card-body" [ngClass]="bodyClasses()">
        @if (title()) {
          <h3 class="card-title" [ngClass]="titleClasses()">{{ title() }}</h3>
        }
        @if (subtitle()) {
          <p class="text-sm text-base-content/60" [ngClass]="subtitleClasses()">
            {{ subtitle() }}
          </p>
        }

        <ng-content />
      </div>
    </div>
  `,
})
export class CardComponent {
  /**
   * Matches how cards are styled in the token generator.
   * - solid: `bg-base-200 border border-base-300`
   * - soft:  `bg-base-200/50 border border-base-300`
   */
  variant = input<CardVariant>('solid');

  /** Optional title rendered as a DaisyUI `card-title`. */
  title = input<string | null>(null);

  /** Optional subtitle rendered under the title. */
  subtitle = input<string | null>(null);

  /** Additional classes applied to the outer `.card`. */
  class = input<string>('');

  /** Additional classes applied to the `.card-body`. */
  bodyClass = input<string>('');

  /** Additional classes applied to the title element. */
  titleClass = input<string>('');

  /** Additional classes applied to the subtitle element. */
  subtitleClass = input<string>('');

  /**
   * When true, applies `h-full` to the card (used by the preview panel).
   */
  fullHeight = input(false);

  cardClasses = computed(() => {
    const base =
      this.variant() === 'soft'
        ? 'bg-base-200/50 border border-base-300'
        : 'bg-base-200 border border-base-300';

    return [base, this.fullHeight() ? 'h-full' : '', this.class()]
      .filter(Boolean)
      .join(' ');
  });

  bodyClasses = computed(() => [this.bodyClass()].filter(Boolean).join(' '));

  titleClasses = computed(() => [this.titleClass()].filter(Boolean).join(' '));

  subtitleClasses = computed(() =>
    [this.subtitleClass()].filter(Boolean).join(' '),
  );
}
