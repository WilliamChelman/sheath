import { AudioData, AudioPathResolver } from '@/audio';
import { Entity } from '@/entity';
import { inject, Injectable } from '@angular/core';
import { FolderEntityService, TauriFsService } from '@/standalone-api';

/**
 * Service for resolving audio file paths to Tauri asset URLs.
 * Handles converting relative paths in AudioData to absolute paths,
 * then to Tauri's asset:// URLs for playback.
 */
@Injectable({ providedIn: 'root' })
export class AudioPathResolverService implements AudioPathResolver {
  private readonly folderEntityService = inject(FolderEntityService);
  private readonly tauriFsService = inject(TauriFsService);

  /**
   * Resolve an audio file path from AudioData to a playable URL.
   * Returns undefined if the path cannot be resolved.
   */
  async resolveAudioUrl(
    entity: Entity,
    audioData: AudioData,
  ): Promise<string | undefined> {
    if (!audioData.audioFilePath) return undefined;

    const absolutePath = this.resolveAbsolutePath(
      entity,
      audioData.audioFilePath,
    );
    if (!absolutePath) return undefined;

    return this.convertToAssetUrl(absolutePath);
  }

  /**
   * Resolve a relative audio file path to an absolute path.
   */
  resolveAbsolutePath(
    entity: Entity,
    relativePath: string,
  ): string | undefined {
    // Get the directory containing the entity's .md file
    const entityDir = this.folderEntityService.getEntityDirectory(entity.id);
    if (!entityDir) return undefined;

    // Handle relative paths starting with ./
    let cleanPath = relativePath;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(2);
    }

    // Join the entity directory with the relative audio path
    return this.tauriFsService.joinPath(entityDir, cleanPath);
  }

  /**
   * Convert an absolute file path to a Tauri asset URL.
   */
  async convertToAssetUrl(absolutePath: string): Promise<string> {
    try {
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      return convertFileSrc(absolutePath);
    } catch (error) {
      console.error('Failed to convert file path to asset URL:', error);
      // Fallback for non-Tauri environments (won't work but useful for debugging)
      return `file://${absolutePath}`;
    }
  }
}
