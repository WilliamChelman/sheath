import { Entity } from '@/entity';
import { I18nService } from '@/i18n';
import { UpperCasePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AudioData } from '../../models/audio.model';
import { AUDIO_PATH_RESOLVER } from '../../services/audio-path-resolver';
import { AudioService } from '../../services/audio.service';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { audioEntityViewerBundle } from './audio-entity-viewer.i18n';

/**
 * Entity-aware wrapper for displaying audio entities.
 * Parses the entity content (JSON string) into AudioData for display.
 */
@Component({
  selector: 'lib-audio-entity-viewer',
  imports: [AudioPlayerComponent, UpperCasePipe],
  template: `
    <div class="space-y-4">
      @if (audioData(); as data) {
        <!-- File metadata display -->
        @if (data.fileMetadata; as meta) {
          <div class="flex gap-4">
            <!-- Album art -->
            @if (meta.albumArt) {
              <img
                [src]="meta.albumArt"
                alt="Album art"
                class="w-32 h-32 rounded-lg object-cover shadow-md"
              />
            }

            <div class="flex-1 space-y-2">
              <!-- Title from metadata or entity name -->
              <h2 class="text-xl font-bold">
                {{ meta.title || entity().name }}
              </h2>

              <!-- Artist & Album -->
              @if (meta.artist) {
                <p class="text-base-content/70">{{ meta.artist }}</p>
              }
              @if (meta.album) {
                <p class="text-sm text-base-content/50">
                  {{ meta.album }}
                  @if (meta.year) {
                    <span>({{ meta.year }})</span>
                  }
                </p>
              }

              <!-- Technical info badges -->
              <div class="flex gap-2 flex-wrap">
                @if (meta.format) {
                  <span class="badge badge-outline">
                    {{ meta.format | uppercase }}
                  </span>
                }
                @if (meta.bitrate) {
                  <span class="badge badge-outline">
                    {{ meta.bitrate }}kbps
                  </span>
                }
                @if (meta.sampleRate) {
                  <span class="badge badge-outline">
                    {{ meta.sampleRate }}Hz
                  </span>
                }
                @if (meta.channels) {
                  <span class="badge badge-outline">
                    {{ meta.channels === 1 ? t('mono') : t('stereo') }}
                  </span>
                }
                @if (meta.genre) {
                  <span class="badge badge-secondary badge-outline">
                    {{ meta.genre }}
                  </span>
                }
              </div>
            </div>
          </div>
        }

        <!-- Audio Player -->
        @if (isResolvingUrl()) {
          <div class="flex items-center justify-center p-4">
            <span class="loading loading-spinner loading-md"></span>
          </div>
        } @else if (audioSrc()) {
          <lib-audio-player
            [src]="audioSrc()!"
            [loopTimestamp]="data.loopTimestamp"
            [loopEnabled]="data.loopEnabled ?? false"
            [initialVolume]="data.volume ?? 1"
            [markers]="data.markers ?? []"
          />
        }

        <!-- Notes -->
        @if (data.notes) {
          <div class="prose prose-sm max-w-none">
            <p class="whitespace-pre-wrap">{{ data.notes }}</p>
          </div>
        }
      } @else {
        <div class="alert alert-warning">
          {{ t('noAudioFile') }}
        </div>
      }
    </div>
  `,
})
export class AudioEntityViewerComponent {
  private readonly audioService = inject(AudioService);
  private readonly i18n = inject(I18nService);
  private readonly pathResolver = inject(AUDIO_PATH_RESOLVER, { optional: true });

  protected readonly t = this.i18n.useBundleT(audioEntityViewerBundle);

  /** Entity object containing audio data in the content field */
  entity = input.required<Entity>();

  protected readonly audioData = computed(() =>
    this.audioService.parseFromEntity(this.entity().content)
  );

  /** Resolved audio URL for playback */
  protected readonly audioSrc = signal<string | undefined>(undefined);

  /** Whether we're currently resolving the audio URL */
  protected readonly isResolvingUrl = signal(false);

  constructor() {
    // Resolve audio URL when entity changes
    effect(() => {
      const ent = this.entity();
      const data = this.audioData();

      if (!data?.audioFilePath) {
        this.audioSrc.set(undefined);
        return;
      }

      this.resolveUrl(ent, data);
    });
  }

  private async resolveUrl(entity: Entity, audioData: AudioData): Promise<void> {
    if (!this.pathResolver) {
      // No resolver available, use raw path (won't work in Tauri)
      console.warn('No AUDIO_PATH_RESOLVER provided, using raw path');
      this.audioSrc.set(audioData.audioFilePath);
      return;
    }

    this.isResolvingUrl.set(true);

    try {
      const url = await this.pathResolver.resolveAudioUrl(entity, audioData);
      this.audioSrc.set(url);
    } catch (error) {
      console.error('Failed to resolve audio URL:', error);
      this.audioSrc.set(undefined);
    } finally {
      this.isResolvingUrl.set(false);
    }
  }
}
