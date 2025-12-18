---
description: Use the local UI component library (`@/ui/*`) consistently (Angular standalone + Tailwind/DaisyUI).
globs:
  - apps/web-app/src/**/*.ts
  - apps/web-app/src/**/*.html
alwaysApply: false
---

## UI components: import + usage rules

### Import rules (mandatory)

- **Always import UI building blocks from the barrel exports**:
  - `@/ui/badge`
  - `@/ui/card`
  - `@/ui/forms`
  - `@/ui/menu`
- **Do not deep-import** from `apps/web-app/src/app/ui/**` (keeps refactors easy and prevents circular deps).

Example:

```ts
import { BadgeComponent } from '@/ui/badge';
import { CardComponent } from '@/ui/card';
import { TextInputComponent, SelectComponent, type SelectOption } from '@/ui/forms';
import {
  DropdownContainerDirective,
  MenuTriggerDirective,
  MenuPanelComponent,
  MenuItemDirective,
} from '@/ui/menu';
```

### Component conventions (follow existing repo patterns)

- **Standalone components only**: add used UI components/directives to `imports: []`.
- **Signals-first**: use `input()`, `model()`, `computed()` and built-in control flow (`@if`, `@for`).
- **Styling**: use Tailwind utilities + DaisyUI classes in templates; avoid component CSS files.

### `app-badge`

- **Use for status tags, counts, and category labels**.
- **Prefer the typed inputs** (`color`, `variant`, `size`) over hand-rolled class strings.

```html
<app-badge color="success" variant="outline" size="sm" label="Available" />
<app-badge color="warning" variant="solid">Coming Soon</app-badge>
```

### `app-card`

- **Prefer `app-card` for consistent card padding/typography**.
- **Use inputs instead of duplicating markup** (`title`, `subtitle`, `variant`, `fullHeight`).

```html
<app-card title="Token Generator" subtitle="Create printable monster tokens" variant="soft">
  <div class="flex gap-2">
    <app-badge color="primary" variant="outline">PNG</app-badge>
    <app-badge color="secondary" variant="outline">PDF</app-badge>
  </div>
</app-card>
```

### Forms (`@/ui/forms`)

General:
- **Use the provided form controls** instead of raw `<input class="input ...">` when possible.
- **Bind using signals** (`model()`), not mutable component fields.

`app-text-input`:

```html
<app-text-input
  label="Name"
  placeholder="e.g. Goblin Boss"
  [maxLength]="32"
  [helperText]="'Shown on the token'"
  [(value)]="name"
/>
```

`app-select`:

```ts
options: SelectOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
];
size = model<'small' | 'medium'>('medium');
```

```html
<app-select label="Size" [options]="options" [(value)]="size" />
```

### Menus (`@/ui/menu`)

Use the wrapper directives/components so menus look and behave consistently:
- `appDropdownContainer`
- `appMenuTrigger` + `[appMenuTriggerFor]`
- `app-menu-panel`
- `appMenuItem`

```html
<div appDropdownContainer align="end">
  <button appMenuTrigger [appMenuTriggerFor]="menu" class="btn btn-ghost btn-circle">
    Menu
  </button>

  <ng-template #menu>
    <app-menu-panel width="12rem">
      <li class="menu-title">Actions</li>
      <li><button appMenuItem (click)="doThing()">Do thing</button></li>
      <li><a appMenuItem routerLink="/tools">Go to tools</a></li>
    </app-menu-panel>
  </ng-template>
</div>
```




