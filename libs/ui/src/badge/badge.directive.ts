import { Directive, input } from '@angular/core';
import { BadgeColor, BadgeSize, BadgeVariant } from './badge.component';

@Directive({
  selector: '[appBadge]',
  standalone: true,
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
})
export class BadgeDirective {
  color = input<BadgeColor>('neutral', { alias: 'appBadge' });
  variant = input<BadgeVariant>('solid', { alias: 'appBadgeVariant' });
  size = input<BadgeSize>('md', { alias: 'appBadgeSize' });
}
