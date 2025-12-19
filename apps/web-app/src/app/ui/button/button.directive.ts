import { booleanAttribute, Directive, input } from '@angular/core';

export type ButtonColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonShape = 'square' | 'circle' | 'none';

@Directive({
  selector: '[appButton]',
  standalone: true,
  host: {
    class: 'btn',
    '[class.btn-neutral]': 'color() === "neutral"',
    '[class.btn-primary]': 'color() === "primary"',
    '[class.btn-secondary]': 'color() === "secondary"',
    '[class.btn-accent]': 'color() === "accent"',
    '[class.btn-info]': 'color() === "info"',
    '[class.btn-success]': 'color() === "success"',
    '[class.btn-warning]': 'color() === "warning"',
    '[class.btn-error]': 'color() === "error"',
    '[class.btn-ghost]': 'color() === "ghost"',
    '[class.btn-link]': 'color() === "link"',
    '[class.btn-outline]': 'outline()',
    '[class.btn-xs]': 'size() === "xs"',
    '[class.btn-sm]': 'size() === "sm"',
    '[class.btn-md]': 'size() === "md"',
    '[class.btn-lg]': 'size() === "lg"',
    '[class.btn-wide]': 'wide()',
    '[class.btn-block]': 'block()',
    '[class.btn-circle]': 'shape() === "circle"',
    '[class.btn-square]': 'shape() === "square"',
  },
})
export class ButtonDirective {
  color = input<ButtonColor | null | ''>(null, { alias: 'appButton' });
  size = input<ButtonSize>('md', { alias: 'appButtonSize' });
  outline = input(false, {
    transform: booleanAttribute,
    alias: 'appButtonOutline',
  });
  wide = input(false, { transform: booleanAttribute, alias: 'appButtonWide' });
  block = input(false, {
    transform: booleanAttribute,
    alias: 'appButtonBlock',
  });
  shape = input<ButtonShape>('none', { alias: 'appButtonShape' });
}
