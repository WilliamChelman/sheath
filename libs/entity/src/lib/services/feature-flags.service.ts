import { computed, Injectable, isDevMode, signal } from '@angular/core';

export type FeatureFlagName = 'entityCreate' | 'entityEdit' | 'entityDelete';
export type FeatureFlagsConfig = Record<FeatureFlagName, boolean>;

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly defaultFlags: FeatureFlagsConfig = {
    entityCreate: isDevMode(),
    entityEdit: isDevMode(),
    entityDelete: isDevMode(),
  };

  private readonly _flags = signal<FeatureFlagsConfig>(this.defaultFlags);
  readonly flags = this._flags.asReadonly();

  readonly canCreateEntity = computed(() => this._flags().entityCreate);
  readonly canEditEntity = computed(() => this._flags().entityEdit);
  readonly canDeleteEntity = computed(() => this._flags().entityDelete);

  isEnabled(flagName: FeatureFlagName): boolean {
    return this._flags()[flagName];
  }

  setFlags(overrides: Partial<FeatureFlagsConfig>): void {
    this._flags.update((current) => ({ ...current, ...overrides }));
  }
}
