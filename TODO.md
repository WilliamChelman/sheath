# Refactoring TODO

This document outlines potential refactoring opportunities identified in the Sheath codebase.

---

## Critical Priority

### 1. Register i18n Bundles in App Config
**File**: `apps/web-app/src/app/app.config.ts:36`

The `bundles: []` array is empty despite 12 i18n bundles being defined across the codebase. All bundles need to be imported and registered for i18n to function properly.

**Bundles to register**:
- `homeBundle` from `./pages/home/home.i18n`
- `aboutBundle` from `./pages/about/about.i18n`
- `navbarBundle` from `./common/navbar/navbar.i18n`
- `footerBundle` from `./common/footer/footer.i18n`
- `languageSwitcherBundle` from `./common/language-switcher/language-switcher.i18n`
- `compendiumBundle` from `./pages/compendium/compendium.i18n`
- `toolsBundle` from `./pages/tools/tools.i18n`
- `tokenCreatorBundle` from `./pages/tools/pages/token-creator/token-creator.i18n`
- `tokenCreatorTourBundle` from `./pages/tools/pages/token-creator/token-creator-tour.i18n`
- `tourBundle` from `./ui/tour/tour.i18n`
- `pwaUpdateToastBundle` from `./common/pwa-update-toast/pwa-update-toast.i18n`
- `notFoundBundle` from `./pages/not-found/not-found.i18n`

---

## High Priority

### 2. Extract Duplicate `generateInitials()` Function
**Files**:
- `apps/web-app/src/app/pages/tools/pages/token-creator/token-creator.view.ts:358-369`
- `apps/web-app/src/app/pages/tools/pages/token-creator/components/token-content-controls.component.ts:182-193`

The same function is implemented twice. Extract to a shared utility:

```typescript
// apps/web-app/src/app/pages/tools/pages/token-creator/utils/initials.util.ts
export function generateInitials(name: string): string {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
```

### 3. Create StorageService Abstraction
**Files with direct localStorage access**:
- `apps/web-app/src/app/pages/tools/pages/token-creator/token-creator.view.ts:382-504`
- `apps/web-app/src/app/common/theme-switch/theme-switch.component.ts:21-28`

Different error handling and validation patterns are used. Create a centralized service:

```typescript
// apps/web-app/src/app/services/storage.service.ts
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string, validator?: (v: unknown) => v is T): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  isAvailable(): boolean;
}
```

---

## Medium Priority

### 4. Standardize Observable/Signal Pattern in EntityService
**File**: `apps/web-app/src/app/entity/services/entity.service.ts`

The service mixes patterns: methods return `Observable<T>` but internal state uses `signal<Map<string, Entity>>`. Consider:
- Option A: Convert return types to signals/computed signals
- Option B: Use `rxResource()` consistently for data fetching
- Option C: Add facade methods that expose signals for consumers who prefer them

### 5. Extract Form Validation Helpers
**File**: `apps/web-app/src/app/pages/tools/pages/token-creator/token-creator.view.ts:382-491`

The extensive type validation logic for persisted config could be extracted to reusable validation utilities:

```typescript
// apps/web-app/src/app/utils/validators.util.ts
export function isValidTokenConfig(value: unknown): value is PersistedTokenConfig;
export function isValidThemeConfig(value: unknown): value is ThemeConfig;
// Generic validators
export function isString(value: unknown): value is string;
export function isNumber(value: unknown): value is number;
export function isInRange(value: number, min: number, max: number): boolean;
```

### 6. Add Global Error Handling
**Affected features**: Compendium data loading, Token export operations

Currently no user-facing error messages for:
- Failed compendium data fetches
- Failed token export/download operations
- IndexedDB errors

Consider:
- Create an `ErrorService` or `NotificationService`
- Add toast/snackbar component for user feedback
- Implement retry mechanisms for transient failures

---

## Low Priority

### 7. Expand Test Coverage
**Current coverage**: ~7 spec files for 60+ components/services (~12%)

Priority areas for new tests:
- [ ] `TokenExportService` - Critical export functionality
- [ ] `CompendiumService` - FlexSearch integration
- [ ] `I18nService` - Locale switching, bundle loading
- [ ] `ThemeSwitchComponent` - Theme persistence
- [ ] `TourService` - Tour state management
- [ ] Form components - Input validation, two-way binding

### 8. Consider Facade Pattern for Complex Features
**Feature**: Compendium

The compendium feature has multiple services (`CompendiumService`, `CompendiumCacheService`, `CompendiumHtmlProcessorService`) that could benefit from a facade to simplify the component-service interface.

### 9. Add Performance Optimizations
**File**: `apps/web-app/src/app/pages/tools/pages/token-creator/components/token-preview.component.ts`

The token SVG generation runs on every change. Consider:
- Memoizing expensive SVG calculations
- Debouncing preview updates during rapid input changes
- Using `ChangeDetectionStrategy.OnPush` (verify current strategy)

### 10. Improve PWA Service Worker Integration
**File**: `apps/web-app/src/app/common/pwa-update-toast/`

The PWA update toast exists but could be enhanced:
- Add offline indicator in the UI
- Improve service worker registration error handling
- Add background sync for offline compendium data

---

## Code Style Improvements

### 11. Consistent Use of TypeScript Strict Features
Review and ensure:
- [ ] No `any` types (prefer `unknown` or proper typing)
- [ ] `readonly` modifiers on appropriate properties
- [ ] Strict null checks respected throughout

### 12. Consider Extracting FormIdService Pattern
**File**: `apps/web-app/src/app/ui/forms/services/form-id.service.ts`

This pattern is well-implemented but could be documented as a composable pattern for custom form components outside the UI library.

---

## Architecture Considerations

### 13. Evaluate Signal-Based State for Entity Service
With Angular 20's improved signal support, consider migrating `EntityService` to use:
- `resource()` or `rxResource()` for async data
- Computed signals for derived collections
- Signal-based queries instead of Observable streams

### 14. Review ViewEncapsulation.None Usage
**File**: `apps/web-app/src/app/pages/compendium/compendium-detail.view.ts:48`

`ViewEncapsulation.None` is used to apply styles to dynamic HTML. Consider:
- Using a CSS class prefix convention
- Documenting why this exception is necessary
- Exploring alternatives like `:host ::ng-deep` (deprecated but safer)

---

## Documentation

### 15. Add JSDoc Comments to Public APIs
Priority services/utilities:
- [ ] `I18nService` public methods
- [ ] `TokenExportService` export methods
- [ ] `CompendiumService` search/filter methods
- [ ] UI component inputs and outputs

---

## Notes

- All file paths are relative to the repository root
- Line numbers may shift as code evolves
- Items are categorized by impact and effort, not strict order
- Consider creating GitHub issues for larger refactoring efforts
