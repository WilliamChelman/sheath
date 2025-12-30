import { Entity } from '@/entity';
import { InjectionToken } from '@angular/core';
import { AudioData } from '../models/audio.model';

/**
 * Interface for resolving audio file paths to playable URLs.
 * This must be implemented by the host application (e.g., standalone app)
 * since path resolution is platform-specific.
 */
export interface AudioPathResolver {
  /**
   * Resolve an audio file path from AudioData to a playable URL.
   * @param entity The entity containing the audio data
   * @param audioData The parsed audio data with the relative file path
   * @returns A Promise resolving to the playable URL, or undefined if resolution fails
   */
  resolveAudioUrl(
    entity: Entity,
    audioData: AudioData
  ): Promise<string | undefined>;
}

/**
 * Injection token for the AudioPathResolver.
 * Host applications should provide their implementation using this token.
 */
export const AUDIO_PATH_RESOLVER = new InjectionToken<AudioPathResolver>(
  'AUDIO_PATH_RESOLVER'
);
