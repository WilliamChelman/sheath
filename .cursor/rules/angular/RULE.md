---
description: Modern Angular 20+ development patterns with Tailwind CSS and DaisyUI
alwaysApply: true
---

# Angular Development Standards

## Framework & Versions

- Angular 20+ with standalone components (default, no need to specify `standalone: true`)
- Tailwind CSS 4 for styling
- DaisyUI 5 for component library
- NX monorepo workspace
- Vitest for unit testing

## Component Architecture

### Component Structure

- Use standalone components exclusively (Angular 20+ default)
- Prefer inline templates for small/medium components (< 50 lines)
- Use separate template files only for large components
- Always use inline styles or Tailwind classes, avoid separate CSS files

### Component Naming Conventions

- **Regular components**: Use `.component.ts` suffix and `Component` class suffix
  - File: `user-card.component.ts` → Class: `UserCardComponent`
- **Routed views** (components loaded via router): Use `.view.ts` suffix and `View` class suffix
  - File: `dashboard.view.ts` → Class: `DashboardView`

```typescript
// ✅ Good: Regular component (reusable UI element)
// File: user-card.component.ts
@Component({
  imports: [CommonModule],
  selector: 'app-user-card',
  template: `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{{ user().name }}</h2>
      </div>
    </div>
  `,
})
export class UserCardComponent {
  user = input.required<User>();
}

// ✅ Good: Routed view (page-level component loaded by router)
// File: dashboard.view.ts
@Component({
  imports: [CommonModule, UserCardComponent],
  selector: 'app-dashboard-view',
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
      }
    </div>
  `,
})
export class DashboardView {
  users = input.required<User[]>();
}

// ❌ Bad: Legacy patterns
@Component({
  standalone: true, // unnecessary in Angular 20+
  templateUrl: './feature.component.html', // avoid separate files for small components
  styleUrls: ['./feature.component.css'], // use Tailwind instead
})
export class Feature {} // missing Component/View suffix
```

### Signals (Preferred State Management)

- Use signals for all reactive state
- Use `input()` and `input.required()` for component inputs
- Use `output()` for component outputs
- Use `computed()` for derived state
- Use `effect()` sparingly, prefer computed signals
- Use `model()` for two-way binding

```typescript
// ✅ Good: Signal-based component
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

// ❌ Bad: Decorator-based (legacy)
export class UserCardComponent {
  @Input() user!: User;
  @Output() userSelected = new EventEmitter<User>();
}
```

### Dependency Injection

- Use `inject()` function instead of constructor injection
- Inject at the field level for cleaner code

```typescript
// ✅ Good: inject() function
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
}

// ❌ Bad: Constructor injection
export class UserService {
  constructor(private http: HttpClient, private router: Router) {}
}
```

### Control Flow (Built-in)

- Use built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives
- Always provide `track` for `@for` loops

```typescript
// ✅ Good: Built-in control flow
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
  
  @switch (status()) {
    @case ('active') { <span class="badge badge-success">Active</span> }
    @case ('pending') { <span class="badge badge-warning">Pending</span> }
    @default { <span class="badge">Unknown</span> }
  }
`;

// ❌ Bad: Structural directives
template: `
  <div *ngIf="isLoading; else content">Loading...</div>
  <div *ngFor="let item of items">{{ item.name }}</div>
`;
```

### Resource API & HTTP

- Use `resource()` and `rxResource()` for data fetching
- Prefer `resource()` for simple async operations
- Use `rxResource()` when integrating with RxJS streams

```typescript
// ✅ Good: Resource API in a view
// File: user-list.view.ts
export class UserListView {
  private userService = inject(UserService);

  searchQuery = signal('');

  usersResource = rxResource({
    request: () => this.searchQuery(),
    loader: ({ request: query }) => this.userService.search(query),
  });

  // Access in template
  // usersResource.value() - the data
  // usersResource.isLoading() - loading state
  // usersResource.error() - error state
}
```

## Styling with Tailwind & DaisyUI

### Tailwind CSS 4 Patterns

- Use Tailwind utility classes directly in templates
- Leverage CSS variables for theming
- Use `@apply` sparingly in global styles only

### DaisyUI Components

- Use DaisyUI component classes for consistent UI
- Combine with Tailwind utilities for customization
- Prefer semantic color classes (`btn-primary`, `badge-success`)

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-outline">Outline</button>
<button class="btn btn-ghost btn-sm">Small Ghost</button>

<!-- Cards -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Form Inputs -->
<input type="text" class="input input-bordered w-full" placeholder="Enter text" />
<select class="select select-bordered">
  <option>Option 1</option>
</select>

<!-- Feedback -->
<div class="alert alert-info">Info message</div>
<span class="badge badge-primary">Badge</span>
<span class="loading loading-spinner loading-md"></span>

<!-- Layout -->
<div class="drawer lg:drawer-open">...</div>
<div class="navbar bg-base-100">...</div>
```

### Responsive Design

- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Mobile-first approach

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid -->
</div>
```

## Services & State

### Service Structure

- Use `providedIn: 'root'` for singleton services
- Use signals for reactive state in services
- Expose readonly signals to consumers

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  private _isAuthenticated = computed(() => this._user() !== null);

  // Expose as readonly
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;

  login(credentials: Credentials) {
    return this.http.post<User>('/api/login', credentials).pipe(tap((user) => this._user.set(user)));
  }
}
```

## Routing

### Route Configuration

- Use functional route guards and resolvers
- Lazy load feature routes

```typescript
// app.routes.ts
export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.view').then((m) => m.DashboardView),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user-list.view').then((m) => m.UserListView),
  },
  {
    path: 'admin',
    canActivate: [() => inject(AuthService).isAuthenticated()],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
];
```

## Forms

### Reactive Forms with Signals

- Use reactive forms with signal integration
- Leverage typed forms

```typescript
// File: login-form.component.ts (reusable form component)
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      // Handle submission
    }
  }
}

// File: login.view.ts (routed page that uses the form)
export class LoginView {
  // View-level logic, uses LoginFormComponent in template
}
```

## Testing with Vitest

### Component Testing

- Use `@analogjs/vitest-angular` for component tests
- Test behavior, not implementation details

```typescript
import { render, screen } from '@testing-library/angular';
import { UserCardComponent } from './user-card.component';

describe('UserCardComponent', () => {
  it('displays user name', async () => {
    await render(UserCardComponent, {
      inputs: { user: { firstName: 'John', lastName: 'Doe' } },
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## File Naming Conventions

- **Components** (reusable UI): `feature-name.component.ts` → `FeatureNameComponent`
- **Views** (routed pages): `feature-name.view.ts` → `FeatureNameView`
- Services: `feature-name.service.ts`
- Pipes: `feature-name.pipe.ts`
- Directives: `feature-name.directive.ts`
- Guards: `feature-name.guard.ts`
- Interceptors: `feature-name.interceptor.ts`
- Models/Types: `feature-name.model.ts` or `feature-name.types.ts`
- Routes: `feature-name.routes.ts`

### When to use Component vs View

| Type      | Suffix                        | Use Case                                  | Example                                |
| --------- | ----------------------------- | ----------------------------------------- | -------------------------------------- |
| Component | `.component.ts` / `Component` | Reusable UI elements, shared across views | `UserCardComponent`, `ButtonComponent` |
| View      | `.view.ts` / `View`           | Page-level components loaded by router    | `DashboardView`, `SettingsView`        |

```
src/app/
├── dashboard/
│   ├── dashboard.view.ts          # Routed page
│   └── dashboard.routes.ts
├── users/
│   ├── user-list.view.ts          # Routed page
│   ├── user-detail.view.ts        # Routed page
│   └── users.routes.ts
└── shared/
    └── components/
        ├── user-card.component.ts  # Reusable component
        ├── button.component.ts     # Reusable component
        └── modal.component.ts      # Reusable component
```

## NX Workspace Conventions

- Generate new components/services using `nx generate`
- Keep shared code in `libs/` directory
- Use project tags for dependency constraints
- Run affected commands for CI efficiency

## Code Quality

- Use strict TypeScript configuration
- Avoid `any` type - use proper typing or `unknown`
- Prefer readonly where applicable
- Use early returns to reduce nesting
