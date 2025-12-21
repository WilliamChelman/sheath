import { Injectable, computed, signal } from '@angular/core';
import {
  Observable,
  combineLatest,
  debounceTime,
  map,
  of,
  startWith,
} from 'rxjs';
import type { Command, CommandProvider } from './models';

/**
 * Service that manages command providers and aggregates search results.
 * Command providers can register themselves to make their commands
 * available in the command palette.
 */
@Injectable({ providedIn: 'root' })
export class CommandRegistryService {
  private readonly _providers = signal<Map<string, CommandProvider>>(new Map());

  /** Read-only signal of registered providers */
  readonly providers = computed(() => Array.from(this._providers().values()));

  /** Observable of the current query string */
  private readonly _query = signal<string>('');
  readonly query = this._query.asReadonly();

  /**
   * Register a command provider.
   * @param provider The provider to register
   */
  registerProvider(provider: CommandProvider): void {
    this._providers.update((map) => {
      const newMap = new Map(map);
      newMap.set(provider.id, provider);
      return newMap;
    });
  }

  /**
   * Unregister a command provider.
   * @param providerId The ID of the provider to unregister
   */
  unregisterProvider(providerId: string): void {
    this._providers.update((map) => {
      const newMap = new Map(map);
      newMap.delete(providerId);
      return newMap;
    });
  }

  /**
   * Search all registered providers for commands matching the query.
   * Results are debounced and aggregated from all providers.
   * @param query The search query string
   * @returns Observable emitting aggregated commands from all providers
   */
  search(query: string): Observable<Command[]> {
    const providers = this.providers();

    if (providers.length === 0) {
      return of([]);
    }

    if (!query.trim()) {
      return of([]);
    }

    // Create observables for each provider's search
    const searches$ = providers.map((provider) =>
      provider.search(query).pipe(
        startWith([] as Command[]),
        map((commands) => ({ providerId: provider.id, commands })),
      ),
    );

    return combineLatest(searches$).pipe(
      debounceTime(150),
      map((results) => {
        // Flatten and combine all commands
        return results.flatMap((r) => r.commands);
      }),
    );
  }
}
