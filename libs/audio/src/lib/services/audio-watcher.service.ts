import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FolderSettingsService, FolderWatcherService } from '@/standalone-api';
import { AUDIO_EXTENSIONS } from '../models/audio.model';
import { AudioDiscoveryService } from './audio-discovery.service';

/**
 * Service that connects folder watching to audio discovery.
 * Automatically creates companion .md entities for new audio files.
 */
@Injectable({ providedIn: 'root' })
export class AudioWatcherService {
  private readonly folderWatcher = inject(FolderWatcherService);
  private readonly audioDiscovery = inject(AudioDiscoveryService);
  private readonly folderSettings = inject(FolderSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly audioExtensions = new Set(
    AUDIO_EXTENSIONS.map((ext) => ext.toLowerCase()),
  );

  // Debounce batch processing
  private pendingFiles = new Set<string>();
  private processTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 500;

  private initialized = false;
  private currentWatchPath: string | null = null;

  /**
   * Initialize watching when folder is set.
   * Should be called once during app startup.
   */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // React to folder path changes
    effect(
      () => {
        const folderPath = this.folderSettings.folderPath();
        this.handleFolderPathChange(folderPath);
      },
      { injector: this.injector },
    );

    // Subscribe to watch events
    this.folderWatcher.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleWatchEvent(event));

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  /**
   * Handle folder path changes - start/stop watching as needed.
   */
  private async handleFolderPathChange(
    folderPath: string | null,
  ): Promise<void> {
    // Stop watching previous folder
    if (this.currentWatchPath && this.currentWatchPath !== folderPath) {
      await this.folderWatcher.unwatch(this.currentWatchPath);
      this.currentWatchPath = null;
    }

    if (folderPath) {
      // Run initial discovery
      await this.runInitialDiscovery();

      // Start watching new folder
      await this.folderWatcher.watch(folderPath);
      this.currentWatchPath = folderPath;
    }
  }

  /**
   * Run initial audio file discovery.
   */
  private async runInitialDiscovery(): Promise<void> {
    try {
      const created = await this.audioDiscovery.discoverAndCreateEntities();
      if (created.length > 0) {
        console.log(
          `Audio discovery: created ${created.length} companion entities`,
        );
      }
    } catch (error) {
      console.error('Audio discovery failed:', error);
    }
  }

  /**
   * Handle file system watch events.
   */
  private handleWatchEvent(event: {
    type: string;
    paths: string[];
    basePath: string;
  }): void {
    // Only interested in create events for audio files
    if (event.type !== 'create' && event.type !== 'any') return;

    for (const path of event.paths) {
      if (this.isAudioFile(path)) {
        this.pendingFiles.add(path);
      }
    }

    // Debounce processing
    if (this.pendingFiles.size > 0) {
      if (this.processTimeout) {
        clearTimeout(this.processTimeout);
      }
      this.processTimeout = setTimeout(() => {
        this.processPendingFiles();
      }, this.DEBOUNCE_MS);
    }
  }

  /**
   * Process pending audio files in batch.
   */
  private async processPendingFiles(): Promise<void> {
    const files = [...this.pendingFiles];
    this.pendingFiles.clear();
    this.processTimeout = null;

    if (files.length === 0) return;

    console.log(`Processing ${files.length} new audio files...`);

    let created = 0;
    for (const audioPath of files) {
      try {
        const entity = await this.audioDiscovery.handleNewAudioFile(audioPath);
        if (entity) {
          created++;
          console.log(`Created audio entity: ${entity.name}`);
        }
      } catch (error) {
        console.error(`Failed to process audio file ${audioPath}:`, error);
      }
    }

    if (created > 0) {
      console.log(
        `Created ${created} audio entities from ${files.length} files`,
      );
    }
  }

  /**
   * Check if a file is an audio file by its extension.
   */
  private isAudioFile(filePath: string): boolean {
    const ext = this.getExtension(filePath);
    return this.audioExtensions.has(ext);
  }

  private getExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? `.${match[1].toLowerCase()}` : '';
  }

  /**
   * Cleanup resources.
   */
  private cleanup(): void {
    if (this.processTimeout) {
      clearTimeout(this.processTimeout);
      this.processTimeout = null;
    }
    this.pendingFiles.clear();
    this.folderWatcher.unwatchAll();
  }
}
