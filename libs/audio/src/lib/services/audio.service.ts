import { Injectable } from '@angular/core';
import {
  AudioData,
  AudioMarker,
  DEFAULT_LOOP_ENABLED,
  DEFAULT_VOLUME,
} from '../models/audio.model';

@Injectable({ providedIn: 'root' })
export class AudioService {
  /**
   * Creates a new empty audio data structure.
   */
  createEmptyAudioData(audioFilePath: string): AudioData {
    return {
      audioFilePath,
      loopEnabled: DEFAULT_LOOP_ENABLED,
      volume: DEFAULT_VOLUME,
      markers: [],
    };
  }

  /**
   * Generates a unique marker ID.
   */
  generateMarkerId(): string {
    return `marker-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Creates a new marker.
   */
  createMarker(name: string, startTime: number, endTime?: number): AudioMarker {
    return {
      id: this.generateMarkerId(),
      name,
      startTime,
      endTime,
    };
  }

  /**
   * Adds a marker to audio data.
   */
  addMarker(audioData: AudioData, marker: AudioMarker): AudioData {
    const markers = [...(audioData.markers ?? []), marker];
    return { ...audioData, markers };
  }

  /**
   * Updates a marker in audio data.
   */
  updateMarker(
    audioData: AudioData,
    markerId: string,
    updates: Partial<AudioMarker>
  ): AudioData {
    const markers = (audioData.markers ?? []).map((m) =>
      m.id === markerId ? { ...m, ...updates, id: m.id } : m
    );
    return { ...audioData, markers };
  }

  /**
   * Removes a marker from audio data.
   */
  removeMarker(audioData: AudioData, markerId: string): AudioData {
    const markers = (audioData.markers ?? []).filter((m) => m.id !== markerId);
    return { ...audioData, markers };
  }

  /**
   * Sorts markers by start time.
   */
  sortMarkers(markers: AudioMarker[]): AudioMarker[] {
    return [...markers].sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Parses AudioData from Entity content (JSON string).
   */
  parseFromEntity(content: string | undefined): AudioData | undefined {
    if (!content) return undefined;

    try {
      return JSON.parse(content) as AudioData;
    } catch {
      return undefined;
    }
  }

  /**
   * Serializes AudioData to JSON string for Entity content.
   */
  serializeToEntity(audioData: AudioData): string {
    return JSON.stringify(audioData, null, 2);
  }

  /**
   * Formats time in seconds to mm:ss or hh:mm:ss format.
   */
  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Parses time string (mm:ss or hh:mm:ss) to seconds.
   */
  parseTime(timeString: string): number {
    const parts = timeString.split(':').map((p) => parseInt(p, 10));

    if (parts.length === 3) {
      // hh:mm:ss
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // mm:ss
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  /**
   * Validates that loop timestamp is within audio duration.
   */
  isLoopTimestampValid(
    loopTimestamp: number,
    duration: number | undefined
  ): boolean {
    if (duration === undefined) return true;
    return loopTimestamp >= 0 && loopTimestamp < duration;
  }

  /**
   * Gets the file extension from a path.
   */
  getFileExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Checks if a file is a supported audio format.
   */
  isAudioFile(filePath: string): boolean {
    const ext = this.getFileExtension(filePath);
    return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'webm'].includes(ext);
  }
}
