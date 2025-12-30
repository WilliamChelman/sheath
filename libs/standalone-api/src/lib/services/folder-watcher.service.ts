import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export interface FolderWatchEvent {
  type: 'create' | 'modify' | 'remove' | 'rename' | 'any';
  paths: string[];
  basePath: string;
}

type UnwatchFn = () => void;

/**
 * Service for watching folder changes using Tauri's fs plugin.
 * Provides a unified interface for file system events.
 */
@Injectable({ providedIn: 'root' })
export class FolderWatcherService implements OnDestroy {
  private watchers = new Map<string, UnwatchFn>();
  private readonly _events$ = new Subject<FolderWatchEvent>();

  readonly events$ = this._events$.asObservable();

  ngOnDestroy(): void {
    this.unwatchAll();
  }

  /**
   * Start watching a folder recursively.
   */
  async watch(folderPath: string): Promise<void> {
    if (this.watchers.has(folderPath)) {
      console.log(`Already watching: ${folderPath}`);
      return;
    }

    try {
      const { watch } = await import('@tauri-apps/plugin-fs');

      const unwatch = await watch(
        folderPath,
        (event) => this.handleEvent(folderPath, event),
        { recursive: true }
      );

      this.watchers.set(folderPath, unwatch);
      console.log(`Started watching: ${folderPath}`);
    } catch (error) {
      console.error(`Failed to watch ${folderPath}:`, error);
    }
  }

  /**
   * Stop watching a folder.
   */
  async unwatch(folderPath: string): Promise<void> {
    const unwatch = this.watchers.get(folderPath);
    if (unwatch) {
      try {
        unwatch();
      } catch (error) {
        console.error(`Failed to unwatch ${folderPath}:`, error);
      }
      this.watchers.delete(folderPath);
      console.log(`Stopped watching: ${folderPath}`);
    }
  }

  /**
   * Stop all watchers.
   */
  unwatchAll(): void {
    for (const [path, unwatch] of this.watchers) {
      try {
        unwatch();
      } catch (error) {
        console.error(`Failed to unwatch ${path}:`, error);
      }
    }
    this.watchers.clear();
  }

  /**
   * Check if a folder is being watched.
   */
  isWatching(folderPath: string): boolean {
    return this.watchers.has(folderPath);
  }

  /**
   * Handle raw Tauri fs watch events.
   */
  private handleEvent(basePath: string, event: unknown): void {
    // Tauri fs watch event structure varies by platform
    // Common structure: { type: string | object, paths: string[] }
    const parsed = this.parseEvent(event);
    if (!parsed) return;

    const folderEvent: FolderWatchEvent = {
      type: parsed.type,
      paths: parsed.paths,
      basePath,
    };

    this._events$.next(folderEvent);
  }

  /**
   * Parse various Tauri fs watch event formats into a normalized structure.
   */
  private parseEvent(
    event: unknown
  ): { type: FolderWatchEvent['type']; paths: string[] } | null {
    if (!event || typeof event !== 'object') return null;

    const e = event as Record<string, unknown>;

    // Extract paths
    let paths: string[] = [];
    if (Array.isArray(e['paths'])) {
      paths = e['paths'].filter((p): p is string => typeof p === 'string');
    } else if (typeof e['path'] === 'string') {
      paths = [e['path']];
    }

    if (paths.length === 0) return null;

    // Extract event type
    let type: FolderWatchEvent['type'] = 'any';

    if (typeof e['type'] === 'string') {
      type = this.mapEventType(e['type']);
    } else if (typeof e['type'] === 'object' && e['type'] !== null) {
      // Some platforms use { create: null } or { modify: { kind: 'data' } }
      const typeObj = e['type'] as Record<string, unknown>;
      const keys = Object.keys(typeObj);
      if (keys.length > 0) {
        type = this.mapEventType(keys[0]);
      }
    } else if (typeof e['kind'] === 'string') {
      type = this.mapEventType(e['kind']);
    }

    return { type, paths };
  }

  /**
   * Map various event type strings to our normalized types.
   */
  private mapEventType(eventType: string): FolderWatchEvent['type'] {
    const normalized = eventType.toLowerCase();

    if (normalized.includes('create') || normalized.includes('add')) {
      return 'create';
    }
    if (normalized.includes('remove') || normalized.includes('delete')) {
      return 'remove';
    }
    if (normalized.includes('rename') || normalized.includes('move')) {
      return 'rename';
    }
    if (
      normalized.includes('modify') ||
      normalized.includes('change') ||
      normalized.includes('write')
    ) {
      return 'modify';
    }

    return 'any';
  }
}
