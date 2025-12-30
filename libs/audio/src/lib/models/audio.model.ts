/**
 * Metadata parsed directly from audio file (read-only).
 * This is extracted from ID3 tags, Vorbis comments, etc.
 */
export interface AudioFileMetadata {
  /** Duration in seconds */
  duration: number;

  /** Sample rate (e.g., 44100, 48000) */
  sampleRate?: number;

  /** Bitrate in kbps (e.g., 320) */
  bitrate?: number;

  /** Number of channels (1 = mono, 2 = stereo) */
  channels?: number;

  /** Audio format (e.g., 'mp3', 'wav', 'ogg', 'flac') */
  format?: string;

  /** File size in bytes */
  fileSize?: number;

  // ID3/metadata tags parsed from file
  /** Track title from metadata */
  title?: string;

  /** Artist name */
  artist?: string;

  /** Album name */
  album?: string;

  /** Release year */
  year?: number;

  /** Genre */
  genre?: string;

  /** Track number on album */
  trackNumber?: number;

  /** Album art (base64 encoded or extracted file path) */
  albumArt?: string;
}

/**
 * User-editable audio settings stored in entity.content.
 */
export interface AudioData {
  /** Reference to actual audio file (relative path from entity) */
  audioFilePath: string;

  /** Cached file metadata (refreshed on load) */
  fileMetadata?: AudioFileMetadata;

  /** Time in seconds where audio should restart when looping */
  loopTimestamp?: number;

  /** Whether looping is enabled by default */
  loopEnabled?: boolean;

  /** Default playback volume (0-1) */
  volume?: number;

  /** Named markers for navigation */
  markers?: AudioMarker[];

  /** User notes/description for this audio */
  notes?: string;
}

/**
 * A named position or region within the audio.
 */
export interface AudioMarker {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Start time in seconds */
  startTime: number;

  /** Optional end time for regions */
  endTime?: number;

  /** Visual indicator color */
  color?: string;
}

/** Supported audio file extensions */
export const AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.ogg',
  '.flac',
  '.m4a',
  '.aac',
  '.webm',
] as const;

export type AudioExtension = (typeof AUDIO_EXTENSIONS)[number];

/** Default audio configuration */
export const DEFAULT_VOLUME = 1;
export const DEFAULT_LOOP_ENABLED = false;
