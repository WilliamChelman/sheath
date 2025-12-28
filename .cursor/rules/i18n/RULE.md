---
description: Implement i18n using the custom `@/i18n` library (bundle-based, signal-friendly, type-safe).
globs:
  - apps/web-app/src/app/**/*.ts
alwaysApply: true
---

## i18n (custom library) rules

### Core concepts

- **Every feature/component/view owns a local bundle** in a colocated `*.i18n.ts` file.
- **Bundles must have unique `namespace` values** across the entire app.
- **`en` is required** in `locales`; other locales are optional (e.g. `fr`).
- Prefer **bundle-scoped translators** (`useBundleT` / `useBundleTSignal`) over raw string keys.

### Bundle granularity

**Prefer component-level bundles** when translations are not reused:

- **Default**: Each component/view gets its own `.i18n.ts` file with only its translations.
- **Consolidate only when**: The same key is genuinely reused by multiple components in the same feature.
- **Never share across features**: Duplicate similar text rather than creating cross-feature dependencies.

### Defining a bundle (`*.i18n.ts`)

Create a bundle next to the component/view file:

```ts
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
    // fr: { ... } // optional
  },
});
```

### Consuming translations in a component/view (preferred)

Use `I18nService` + a bundle-scoped translator:

```ts
import { Component, inject } from '@angular/core';
import { I18nService } from '@/i18n';
import { exampleBundle } from './example.i18n';

@Component({
  selector: 'app-example',
  template: `
    <h1 class="text-2xl font-bold">{{ t('title') }}</h1>
    <p>{{ t('welcome', { name: 'Will' }) }}</p>
  `,
})
export class ExampleComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(exampleBundle);
}
```

### When to use signal translations

If you want a **Signal<string>** (auto updates on locale change without calling `t()` in template):

```ts
title = this.i18n.translate('home.hero.title');
// template: {{ title() }}
```

Or bundle-scoped signals:

```ts
protected readonly ts = this.i18n.useBundleTSignal(exampleBundle);
title = this.ts('title');
// template: {{ title() }}
```

### ICU message formatting

- Use ICU messages for pluralization/selection.
- Pass primitive params only (`string | number | boolean | Date | null | undefined`).

```ts
// locale string example
// "{count, plural, =0 {No tools} one {# tool} other {# tools}} available"
```

### App registration (important)

When you add a new bundle, **register it at app init** so `availableLocales()` and namespaced lookups work.

- Keep the initialization in `apps/web-app/src/app/app.config.ts`.
- The `bundles: []` list must include all app bundles (navbar/footer/page bundles, etc.).

If you’re unsure where to add it, search for existing `defineI18nBundle(...)` exports and ensure they’re included in `i18n.init({ ..., bundles: [...] })`.

### Avoid

- **Do not hardcode UI strings** directly in templates/components (use bundles).
- **Do not reuse namespaces** across bundles (runtime error).
- **Do not deep-import** i18n internals; only use `@/i18n` public API.
- **Do not create feature-level bundles** when component-level bundles suffice.
- **Do not share bundles** between unrelated components just because they have similar text.


