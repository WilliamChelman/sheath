import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type BadgeColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type BadgeVariant = 'solid' | 'outline' | 'ghost';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="badgeClasses()">
      @if (label() !== null) {
        {{ label() }}
      } @else {
        <ng-content />
      }
    </span>
  `,
})
export class BadgeComponent {
  /** Optional label. If omitted, renders projected content. */
  label = input<string | null>(null);

  color = input<BadgeColor>('neutral');
  variant = input<BadgeVariant>('solid');
  size = input<BadgeSize>('md');

  /** Additional classes applied to the `.badge`. */
  class = input<string>('');

  badgeClasses = computed(() => {
    const colorClass = `badge-${this.color()}`;

    const variantClass =
      this.variant() === 'outline'
        ? 'badge-outline'
        : this.variant() === 'ghost'
          ? 'badge-ghost'
          : '';

    const sizeClass =
      this.size() === 'xs'
        ? 'badge-xs'
        : this.size() === 'sm'
          ? 'badge-sm'
          : this.size() === 'lg'
            ? 'badge-lg'
            : '';

    return [colorClass, variantClass, sizeClass, this.class()]
      .filter(Boolean)
      .join(' ');
  });
}
