import { Component, input } from '@angular/core';

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
  host: {
    class: 'badge',
    '[class.badge-neutral]': 'color() === "neutral"',
    '[class.badge-primary]': 'color() === "primary"',
    '[class.badge-secondary]': 'color() === "secondary"',
    '[class.badge-accent]': 'color() === "accent"',
    '[class.badge-info]': 'color() === "info"',
    '[class.badge-success]': 'color() === "success"',
    '[class.badge-warning]': 'color() === "warning"',
    '[class.badge-error]': 'color() === "error"',
    '[class.badge-outline]': 'variant() === "outline"',
    '[class.badge-ghost]': 'variant() === "ghost"',
    '[class.badge-xs]': 'size() === "xs"',
    '[class.badge-sm]': 'size() === "sm"',
    '[class.badge-md]': 'size() === "md"',
    '[class.badge-lg]': 'size() === "lg"',
  },
  template: `
    @if (label() !== null) {
      {{ label() }}
    } @else {
      <ng-content />
    }
  `,
})
export class BadgeComponent {
  /** Optional label. If omitted, renders projected content. */
  label = input<string | null>(null);

  color = input<BadgeColor>('neutral');
  variant = input<BadgeVariant>('solid');
  size = input<BadgeSize>('md');
}
