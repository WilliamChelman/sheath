import { Injectable } from '@angular/core';
import { AudioFileMetadata } from '../models/audio.model';

/**
 * Service for parsing metadata from audio files.
 *
 * For now, this uses basic browser-based metadata extraction.
 * In the future, this could be enhanced with Tauri commands using
 * Rust crates like `lofty` or `symphonia` for more comprehensive
 * metadata parsing including ID3 tags, Vorbis comments, etc.
 */
@Injectable({ providedIn: 'root' })
export class AudioMetadataService {
  /**
   * Parse basic metadata from an audio file using the browser's
   * built-in audio capabilities.
   */
  async parseMetadata(filePath: string): Promise<AudioFileMetadata> {
    // Convert file path to a URL that Tauri can serve
    const audioUrl = await this.convertFileSrc(filePath);

    return new Promise((resolve) => {
      const audio = new Audio();

      audio.addEventListener('loadedmetadata', () => {
        const metadata: AudioFileMetadata = {
          duration: audio.duration,
          format: this.getFormatFromPath(filePath),
        };
        resolve(metadata);
      });

      audio.addEventListener('error', () => {
        // Return basic metadata even on error
        resolve({
          duration: 0,
          format: this.getFormatFromPath(filePath),
        });
      });

      // Set a timeout to avoid hanging
      const timeout = setTimeout(() => {
        resolve({
          duration: 0,
          format: this.getFormatFromPath(filePath),
        });
      }, 5000);

      audio.addEventListener('loadedmetadata', () => clearTimeout(timeout));
      audio.addEventListener('error', () => clearTimeout(timeout));

      audio.src = audioUrl;
      audio.load();
    });
  }

  /**
   * Get audio duration only (lightweight).
   */
  async getDuration(filePath: string): Promise<number> {
    const metadata = await this.parseMetadata(filePath);
    return metadata.duration;
  }

  /**
   * Convert a file path to a URL that can be used in the browser.
   * Uses Tauri's convertFileSrc for proper file:// URL handling.
   */
  async convertFileSrc(filePath: string): Promise<string> {
    try {
      const { convertFileSrc } = await import('@tauri-apps/api/core');
      return convertFileSrc(filePath);
    } catch {
      // Fallback for non-Tauri environments
      return `file://${filePath}`;
    }
  }

  /**
   * Extract format from file path extension.
   */
  private getFormatFromPath(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Estimate file size from file stats (requires Tauri fs plugin).
   */
  async getFileSize(filePath: string): Promise<number | undefined> {
    try {
      const { stat } = await import('@tauri-apps/plugin-fs');
      const stats = await stat(filePath);
      return stats.size;
    } catch {
      return undefined;
    }
  }
}
