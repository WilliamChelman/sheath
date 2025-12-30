import { Entity, EntityInput } from '@/entity';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  FolderEntityService,
  FolderSettingsService,
  generateEntityId,
  toKebabCase,
  TauriFsService,
} from '@/standalone-api';
import { AudioData, AUDIO_EXTENSIONS } from '../models/audio.model';
import { AUDIO_TYPE_ID } from '../models/audio.config';
import { AudioMetadataService } from './audio-metadata.service';

/**
 * Service for discovering audio files and automatically creating
 * companion .md entity files for them.
 */
@Injectable({ providedIn: 'root' })
export class AudioDiscoveryService {
  private readonly tauriFsService = inject(TauriFsService);
  private readonly audioMetadataService = inject(AudioMetadataService);
  private readonly folderEntityService = inject(FolderEntityService);
  private readonly folderSettings = inject(FolderSettingsService);

  private readonly audioExtensions = new Set(
    AUDIO_EXTENSIONS.map((ext) => ext.toLowerCase()),
  );

  /**
   * Scan folder for audio files without companion .md entities
   * and create them automatically.
   */
  async discoverAndCreateEntities(): Promise<Entity[]> {
    const folderPath = this.folderSettings.folderPath();
    if (!folderPath) return [];

    const audioFiles = await this.scanAudioFiles(folderPath);
    const existingEntities = await firstValueFrom(
      this.folderEntityService.getAll(),
    );

    const orphanedAudioFiles = this.findOrphanedAudioFiles(
      audioFiles,
      existingEntities,
      folderPath,
    );

    if (orphanedAudioFiles.length === 0) return [];

    console.log(
      `Found ${orphanedAudioFiles.length} audio files without companion entities`,
    );

    const newEntities: EntityInput[] = [];

    for (const audioPath of orphanedAudioFiles) {
      try {
        const entity = await this.createEntityInputForAudioFile(
          audioPath,
          folderPath,
        );
        if (entity) {
          newEntities.push(entity);
        }
      } catch (error) {
        console.error(`Failed to create entity for ${audioPath}:`, error);
      }
    }

    if (newEntities.length > 0) {
      const created = await firstValueFrom(
        this.folderEntityService.create(newEntities),
      );
      console.log(`Created ${created.length} audio entities`);
      return created;
    }

    return [];
  }

  /**
   * Handle a single new audio file (called by file watcher).
   */
  async handleNewAudioFile(audioPath: string): Promise<Entity | null> {
    const folderPath = this.folderSettings.folderPath();
    if (!folderPath) return null;

    // Check if it's an audio file
    if (!this.isAudioFile(audioPath)) return null;

    // Check if companion .md already exists
    const companionPath = this.getCompanionMdPath(audioPath);
    const companionExists = await this.tauriFsService.exists(companionPath);
    if (companionExists) return null;

    // Check if any entity already references this audio file
    const existingEntities = await firstValueFrom(
      this.folderEntityService.getAll(),
    );
    const isReferenced = this.isAudioFileReferenced(
      audioPath,
      existingEntities,
      folderPath,
    );
    if (isReferenced) return null;

    const entityInput = await this.createEntityInputForAudioFile(
      audioPath,
      folderPath,
    );
    if (!entityInput) return null;

    const created = await firstValueFrom(
      this.folderEntityService.create([entityInput]),
    );
    return created[0] ?? null;
  }

  /**
   * Recursively scan for audio files.
   */
  private async scanAudioFiles(folderPath: string): Promise<string[]> {
    const results: string[] = [];
    await this.walkDir(folderPath, results);
    return results;
  }

  private async walkDir(dirPath: string, results: string[]): Promise<void> {
    try {
      const entries = await this.tauriFsService.readDir(dirPath);

      for (const entry of entries) {
        const fullPath = this.tauriFsService.joinPath(dirPath, entry.name);

        if (entry.isDirectory) {
          await this.walkDir(fullPath, results);
        } else if (entry.isFile && this.isAudioFile(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dirPath}:`, error);
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
   * Get the companion .md path for an audio file.
   */
  private getCompanionMdPath(audioPath: string): string {
    return audioPath.replace(/\.[^.]+$/, '.md');
  }

  /**
   * Find audio files that don't have a corresponding entity.
   */
  private findOrphanedAudioFiles(
    audioFiles: string[],
    existingEntities: Entity[],
    folderPath: string,
  ): string[] {
    return audioFiles.filter((audioPath) => {
      // Check if any entity references this audio file
      return !this.isAudioFileReferenced(
        audioPath,
        existingEntities,
        folderPath,
      );
    });
  }

  /**
   * Check if an audio file is referenced by any existing entity.
   */
  private isAudioFileReferenced(
    audioPath: string,
    entities: Entity[],
    folderPath: string,
  ): boolean {
    const normalizedAudioPath = this.normalizePath(audioPath);

    for (const entity of entities) {
      if (entity.type !== AUDIO_TYPE_ID) continue;

      try {
        const audioData: AudioData = JSON.parse(entity.content ?? '{}');
        if (!audioData.audioFilePath) continue;

        // Get the entity's directory to resolve relative paths
        // Entity files are stored at: folderPath/type/path/name.md
        // Audio files are typically next to them
        const entityTypePath = entity.type.split('.').join('/');
        const entityDir = this.tauriFsService.joinPath(
          folderPath,
          entityTypePath,
        );

        // Resolve the relative audio path
        let resolvedAudioPath = audioData.audioFilePath;
        if (resolvedAudioPath.startsWith('./')) {
          resolvedAudioPath = resolvedAudioPath.substring(2);
        }
        const absoluteAudioPath = this.tauriFsService.joinPath(
          entityDir,
          resolvedAudioPath,
        );
        const normalizedEntityAudioPath = this.normalizePath(absoluteAudioPath);

        if (normalizedAudioPath === normalizedEntityAudioPath) {
          return true;
        }
      } catch {
        // Invalid content, skip
      }
    }

    return false;
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').toLowerCase();
  }

  /**
   * Create an EntityInput for a discovered audio file.
   */
  private async createEntityInputForAudioFile(
    audioPath: string,
    folderPath: string,
  ): Promise<EntityInput | null> {
    try {
      // Parse metadata from the audio file
      const metadata = await this.audioMetadataService.parseMetadata(audioPath);

      // Get file size
      const fileSize = await this.audioMetadataService.getFileSize(audioPath);
      if (fileSize !== undefined) {
        metadata.fileSize = fileSize;
      }

      // Generate entity name from filename or ID3 title
      const fileName = this.tauriFsService.basename(audioPath);
      const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
      const name = metadata.title || this.toTitleCase(nameWithoutExt);

      // Calculate relative path (companion .md will be next to audio file)
      const relativePath = `./${fileName}`;

      const audioData: AudioData = {
        audioFilePath: relativePath,
        fileMetadata: metadata,
        loopEnabled: false,
        volume: 1,
      };

      const now = new Date().toISOString();
      const id = generateEntityId(AUDIO_TYPE_ID, name);

      // The entity will be created in the same directory as the audio file
      // We need to compute what the path should be
      const audioDir = this.tauriFsService.dirname(audioPath);
      const entityFileName = `${toKebabCase(name)}.md`;
      const entityPath = this.tauriFsService.joinPath(audioDir, entityFileName);

      return {
        id,
        type: AUDIO_TYPE_ID,
        name,
        description: this.buildDescription(metadata),
        tags: this.inferTags(metadata, audioPath),
        content: JSON.stringify(audioData, null, 2),
        createdAt: now,
        updatedAt: now,
        // Custom field to hint the file path (handled by FolderEntityService)
        _pathHint: entityPath,
      } as EntityInput & { _pathHint: string };
    } catch (error) {
      console.error(`Failed to create entity for ${audioPath}:`, error);
      return null;
    }
  }

  /**
   * Convert kebab-case or snake_case to Title Case.
   */
  private toTitleCase(str: string): string {
    return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Build description from metadata.
   */
  private buildDescription(metadata: {
    artist?: string;
    album?: string;
    year?: number;
  }): string {
    const parts: string[] = [];

    if (metadata.artist) parts.push(metadata.artist);
    if (metadata.album) parts.push(metadata.album);
    if (metadata.year) parts.push(`(${metadata.year})`);

    return parts.join(' - ') || '';
  }

  /**
   * Infer tags from metadata and file path.
   */
  private inferTags(
    metadata: { genre?: string; format?: string },
    audioPath: string,
  ): string[] {
    const tags: string[] = [];

    if (metadata.genre) tags.push(metadata.genre.toLowerCase());
    if (metadata.format) tags.push(metadata.format);

    // Infer from folder structure (e.g., /music/ambient/ -> 'ambient')
    const pathParts = audioPath.split(/[/\\]/);
    const relevantFolders = pathParts.slice(-3, -1); // Last 2 folders before filename

    for (const folder of relevantFolders) {
      const normalized = folder.toLowerCase();
      // Skip common structural folders
      if (
        ![
          'audio',
          'music',
          'sounds',
          'sheath',
          'core',
          'data',
          'assets',
        ].includes(normalized)
      ) {
        tags.push(normalized);
      }
    }

    return [...new Set(tags)]; // Dedupe
  }
}
