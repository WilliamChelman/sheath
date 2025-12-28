# Sheath Project Guidelines

## Project Overview

- **Framework**: Angular 20+ with standalone components
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Icons**: ng-icons (`@ng-icons/core`, `@ng-icons/heroicons`, `@ng-icons/simple-icons`)
- **Workspace**: NX monorepo
- **Testing**: Vitest with `@analogjs/vitest-angular`
- **i18n**: Custom `@/i18n` library (bundle-based, signal-friendly, type-safe)

---

## Angular Development Standards

### Component Architecture

**Standalone components only** (Angular 20+ default, no need for `standalone: true`).

**Naming conventions:**

- Regular components: `feature-name.component.ts` → `FeatureNameComponent`
- Routed views: `feature-name.view.ts` → `FeatureNameView`

**Template preferences:**

- Inline templates for small/medium components (< 50 lines)
- Separate template files only for large components
- Always use Tailwind classes, avoid separate CSS files

### Signals (Preferred State Management)

Use signals for all reactive state:

```typescript
export class UserCardComponent {
  // Inputs
  user = input.required<User>();
  showDetails = input(false);

  // Outputs
  userSelected = output<User>();

  // Two-way binding
  isExpanded = model(false);

  // Computed
  fullName = computed(() => `${this.user().firstName} ${this.user().lastName}`);

  // Local state
  isLoading = signal(false);
}
```

**Avoid decorator-based inputs/outputs** (`@Input`, `@Output`).

### Dependency Injection

Use `inject()` function instead of constructor injection:

```typescript
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
}
```

### Control Flow

Use built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives:

```typescript
template: `
  @if (isLoading()) {
    <span class="loading loading-spinner"></span>
  } @else {
    @for (item of items(); track item.id) {
      <div class="card">{{ item.name }}</div>
    } @empty {
      <p>No items found</p>
    }
  }
`;
```

**Avoid**: `*ngIf`, `*ngFor`, `*ngSwitch`

### Resource API & HTTP

Use `resource()` and `rxResource()` for data fetching:

```typescript
export class UserListView {
  private userService = inject(UserService);
  searchQuery = signal('');

  usersResource = rxResource({
    request: () => this.searchQuery(),
    loader: ({ request: query }) => this.userService.search(query),
  });
}
```

### Services

- Use `providedIn: 'root'` for singleton services
- Use signals for reactive state
- Expose readonly signals to consumers

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
}
```

### Routing

- Use functional route guards and resolvers
- Lazy load feature routes

```typescript
export const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.view').then((m) => m.DashboardView),
  },
  {
    path: 'admin',
    canActivate: [() => inject(AuthService).isAuthenticated()],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
];
```

### Forms

Use reactive forms with typed forms:

```typescript
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
}
```

---

## Styling with Tailwind & DaisyUI

### DaisyUI Components

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-outline">Outline</button>

<!-- Cards -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Form Inputs -->
<input type="text" class="input input-bordered w-full" />
<select class="select select-bordered">
  ...
</select>

<!-- Feedback -->
<div class="alert alert-info">Info message</div>
<span class="badge badge-primary">Badge</span>
<span class="loading loading-spinner loading-md"></span>
```

### Responsive Design

Mobile-first with Tailwind responsive prefixes:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
```

---

## Icons with ng-icons

### Usage

```typescript
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroBars3 } from '@ng-icons/heroicons/outline';
import { heroCheckCircleSolid } from '@ng-icons/heroicons/solid';
import { simpleGithub } from '@ng-icons/simple-icons';

@Component({
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroCheckCircleSolid, simpleGithub })],
  template: `
    <ng-icon name="heroMagnifyingGlass" class="text-xl" />
    <ng-icon name="heroCheckCircleSolid" class="text-success text-2xl" />
    <ng-icon name="simpleGithub" class="text-2xl" />
  `,
})
```

### Naming Conventions

- **Heroicons outline**: `hero{IconName}` (e.g., `heroMagnifyingGlass`)
- **Heroicons solid**: `hero{IconName}Solid` (e.g., `heroCheckCircleSolid`)
- **Simple Icons**: `simple{BrandName}` (e.g., `simpleGithub`)

### Sizing

Use Tailwind text size classes: `text-sm`, `text-xl`, `text-3xl`, etc.

---

## i18n (Custom Library)

### Core Concepts

- Every feature/component/view owns a local bundle in a colocated `*.i18n.ts` file
- Bundles must have **unique namespace values** across the app
- `en` is required in `locales`; other locales are optional

### Bundle Granularity

**Prefer component-level bundles** when translations are not reused:

- **Default**: Each component/view gets its own `.i18n.ts` file
- **Consolidate only when**: The same key is genuinely reused across multiple components in the same feature
- **Never share across features**: Duplicate similar text rather than creating cross-feature dependencies

**Example - Prefer This:**

```
user-profile/
├── user-profile.view.ts
├── user-profile.i18n.ts      # Only keys for this view
├── user-avatar.component.ts
└── user-avatar.i18n.ts       # Only keys for this component
```

**Over This:**

```
user-profile/
├── user-profile.view.ts
├── user-avatar.component.ts
└── user-profile.i18n.ts      # All keys for the feature
```

### Defining a Bundle

Create `*.i18n.ts` next to the component/view:

```typescript
import { defineI18nBundle } from '@/i18n';

export const exampleBundle = defineI18nBundle({
  namespace: 'example',
  schema: {
    title: { message: '' },
    welcome: { message: '', params: {} as { name: string } },
  } as const,
  locales: {
    en: {
      title: 'Example',
      welcome: 'Welcome, {name}!',
    },
  },
});
```

### Using Translations

```typescript
import { I18nService } from '@/i18n';
import { exampleBundle } from './example.i18n';

export class ExampleComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(exampleBundle);
}
```

Template:

```html
<h1>{{ t('title') }}</h1>
<p>{{ t('welcome', { name: 'Will' }) }}</p>
```

### Signal Translations

For auto-updating on locale change:

```typescript
protected readonly ts = this.i18n.useBundleTSignal(exampleBundle);
title = this.ts('title');
// template: {{ title() }}
```

### Avoid

- Do not hardcode UI strings in templates
- Do not reuse namespaces across bundles
- Do not deep-import i18n internals; only use `@/i18n` public API
- Do not create feature-level bundles when component-level bundles suffice
- Do not share bundles between unrelated components just because they have similar text

---

## UI Component Library (`@/ui/*`)

### Import Rules

Always import from barrel exports:

```typescript
import { BadgeComponent } from '@/ui/badge';
import { CardComponent } from '@/ui/card';
import { TextInputComponent, SelectComponent, type SelectOption } from '@/ui/forms';
import { DropdownContainerDirective, MenuTriggerDirective, MenuPanelComponent, MenuItemDirective } from '@/ui/menu';
```

**Do not deep-import** from `apps/web-app/src/app/ui/**`.

### Badge (`app-badge`)

```html
<app-badge color="success" variant="outline" size="sm" label="Available" /> <app-badge color="warning" variant="solid">Coming Soon</app-badge>
```

### Card (`app-card`)

```html
<app-card title="Token Generator" subtitle="Create printable monster tokens" variant="soft">
  <div class="flex gap-2">
    <app-badge color="primary" variant="outline">PNG</app-badge>
  </div>
</app-card>
```

### Forms

```html
<app-text-input label="Name" placeholder="e.g. Goblin Boss" [maxLength]="32" [(value)]="name" />

<app-select label="Size" [options]="options" [(value)]="size" />
```

### Menus

```html
<div appDropdownContainer align="end">
  <button appMenuTrigger [appMenuTriggerFor]="menu" class="btn btn-ghost btn-circle">Menu</button>

  <ng-template #menu>
    <app-menu-panel width="12rem">
      <li class="menu-title">Actions</li>
      <li><button appMenuItem (click)="doThing()">Do thing</button></li>
    </app-menu-panel>
  </ng-template>
</div>
```

---

## File Structure

```
src/app/
├── dashboard/
│   ├── dashboard.view.ts          # Routed page
│   ├── dashboard.i18n.ts          # i18n bundle
│   └── dashboard.routes.ts
├── users/
│   ├── user-list.view.ts          # Routed page
│   ├── user-detail.view.ts        # Routed page
│   └── users.routes.ts
└── shared/
    └── components/
        ├── user-card.component.ts  # Reusable component
        └── modal.component.ts      # Reusable component
```

## File Naming

| Type        | Suffix                        | Example                  |
| ----------- | ----------------------------- | ------------------------ |
| Component   | `.component.ts` / `Component` | `user-card.component.ts` |
| View        | `.view.ts` / `View`           | `dashboard.view.ts`      |
| Service     | `.service.ts`                 | `auth.service.ts`        |
| Pipe        | `.pipe.ts`                    | `format-date.pipe.ts`    |
| Directive   | `.directive.ts`               | `highlight.directive.ts` |
| Guard       | `.guard.ts`                   | `auth.guard.ts`          |
| Interceptor | `.interceptor.ts`             | `error.interceptor.ts`   |
| Model/Types | `.model.ts` / `.types.ts`     | `user.model.ts`          |
| Routes      | `.routes.ts`                  | `admin.routes.ts`        |
| i18n Bundle | `.i18n.ts`                    | `dashboard.i18n.ts`      |

---

## Code Quality

- Use strict TypeScript configuration
- Avoid `any` type - use proper typing or `unknown`
- Prefer readonly where applicable
- Use early returns to reduce nesting
