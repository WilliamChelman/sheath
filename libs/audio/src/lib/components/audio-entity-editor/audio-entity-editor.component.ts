import { Entity } from '@/entity';
import { I18nService } from '@/i18n';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCheck,
  phosphorPlus,
  phosphorTrash,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import { AudioData, AudioMarker } from '../../models/audio.model';
import { AUDIO_PATH_RESOLVER } from '../../services/audio-path-resolver';
import { AudioService } from '../../services/audio.service';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { audioEntityEditorBundle } from './audio-entity-editor.i18n';

/**
 * Entity-aware editor for audio entities.
 * Handles editing audio settings and emitting save/cancel events.
 */
@Component({
  selector: 'lib-audio-entity-editor',
  imports: [NgIcon, FormsModule, AudioPlayerComponent],
  viewProviders: [
    provideIcons({ phosphorCheck, phosphorX, phosphorPlus, phosphorTrash }),
  ],
  template: `
    <div class="h-full flex flex-col">
      <!-- Toolbar -->
      <div
        class="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50"
      >
        <span class="text-sm font-medium">{{ t('editAudio') }}</span>
        <div class="flex gap-2">
          <button
            class="btn btn-ghost btn-sm"
            (click)="handleCancel()"
            [disabled]="isSaving()"
          >
            <ng-icon name="phosphorX" class="text-base" />
            {{ t('cancel') }}
          </button>
          <button
            class="btn btn-primary btn-sm"
            (click)="handleSave()"
            [disabled]="isSaving()"
          >
            @if (isSaving()) {
              <span class="loading loading-spinner loading-xs"></span>
            } @else {
              <ng-icon name="phosphorCheck" class="text-base" />
            }
            {{ t('save') }}
          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-auto p-4 space-y-6">
        <!-- Preview Player -->
        @if (isResolvingUrl()) {
          <div class="flex items-center justify-center p-4">
            <span class="loading loading-spinner loading-md"></span>
          </div>
        } @else if (audioSrc()) {
          <lib-audio-player
            [src]="audioSrc()!"
            [loopTimestamp]="loopTimestamp()"
            [loopEnabled]="loopEnabled()"
            [initialVolume]="volume()"
            [markers]="markers()"
            (timeUpdate)="currentPlayerTime.set($event)"
          />
        }

        <!-- Playback Settings -->
        <div class="card bg-base-200 p-4 space-y-4">
          <h3 class="font-semibold">{{ t('playbackSettings') }}</h3>

          <!-- Loop Enabled -->
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                [checked]="loopEnabled()"
                (change)="loopEnabled.set(asCheckbox($event).checked)"
              />
              <span class="label-text">{{ t('enableLoop') }}</span>
            </label>
          </div>

          <!-- Loop Timestamp -->
          @if (loopEnabled()) {
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ t('loopTimestamp') }}</span>
                <span class="label-text-alt">
                  {{ audioService.formatTime(loopTimestamp() ?? 0) }}
                </span>
              </label>
              <div class="flex gap-2 items-center">
                <input
                  type="range"
                  class="range range-sm flex-1"
                  min="0"
                  [max]="duration()"
                  step="0.1"
                  [value]="loopTimestamp() ?? 0"
                  (input)="loopTimestamp.set(+asInput($event).value)"
                />
                <button
                  class="btn btn-xs btn-outline"
                  (click)="setLoopFromCurrent()"
                >
                  {{ t('setFromCurrent') }}
                </button>
              </div>
              <label class="label">
                <span class="label-text-alt text-base-content/50">
                  {{ t('loopTimestampHelp') }}
                </span>
              </label>
            </div>
          }

          <!-- Default Volume -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('defaultVolume') }}</span>
              <span class="label-text-alt">
                {{ Math.round(volume() * 100) }}%
              </span>
            </label>
            <input
              type="range"
              class="range range-sm"
              min="0"
              max="1"
              step="0.01"
              [value]="volume()"
              (input)="volume.set(+asInput($event).value)"
            />
          </div>
        </div>

        <!-- Markers Editor -->
        <div class="card bg-base-200 p-4 space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">{{ t('markers') }}</h3>
            <button class="btn btn-sm btn-ghost" (click)="addMarker()">
              <ng-icon name="phosphorPlus" class="text-base" />
              {{ t('addMarker') }}
            </button>
          </div>

          @for (marker of markers(); track marker.id; let i = $index) {
            <div class="flex gap-2 items-center">
              <input
                type="text"
                class="input input-sm input-bordered flex-1"
                [placeholder]="t('markerName')"
                [value]="marker.name"
                (input)="updateMarkerName(i, asInput($event).value)"
              />
              <input
                type="number"
                class="input input-sm input-bordered w-24"
                [placeholder]="t('markerTime')"
                [value]="marker.startTime"
                step="0.1"
                min="0"
                (input)="updateMarkerTime(i, +asInput($event).value)"
              />
              <button
                class="btn btn-sm btn-ghost btn-square text-error"
                (click)="removeMarker(i)"
              >
                <ng-icon name="phosphorTrash" class="text-base" />
              </button>
            </div>
          }

          @if (markers().length === 0) {
            <p class="text-sm text-base-content/50 text-center py-2">
              No markers defined
            </p>
          }
        </div>

        <!-- Notes -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">{{ t('notes') }}</span>
          </label>
          <textarea
            class="textarea textarea-bordered h-32"
            [placeholder]="t('notesPlaceholder')"
            [value]="notes()"
            (input)="notes.set(asTextarea($event).value)"
          ></textarea>
        </div>
      </div>
    </div>
  `,
})
export class AudioEntityEditorComponent {
  protected readonly audioService = inject(AudioService);
  private readonly i18n = inject(I18nService);
  private readonly pathResolver = inject(AUDIO_PATH_RESOLVER, { optional: true });

  protected readonly t = this.i18n.useBundleT(audioEntityEditorBundle);
  protected readonly Math = Math;

  // Standard entity editor inputs
  entity = input.required<Entity>();
  isSaving = input(false);
  save = input.required<(updates: Partial<Entity>) => void>();
  cancel = input.required<() => void>();

  // Editable state
  loopEnabled = signal(false);
  loopTimestamp = signal<number | undefined>(undefined);
  volume = signal(1);
  markers = signal<AudioMarker[]>([]);
  notes = signal('');

  // Player state
  currentPlayerTime = signal(0);
  duration = signal(0);

  /** Resolved audio URL for playback */
  protected readonly audioSrc = signal<string | undefined>(undefined);

  /** Whether we're currently resolving the audio URL */
  protected readonly isResolvingUrl = signal(false);

  // Computed
  protected readonly audioData = computed(() =>
    this.audioService.parseFromEntity(this.entity().content)
  );

  constructor() {
    // Initialize state from entity and resolve audio URL
    effect(() => {
      const ent = this.entity();
      const data = this.audioData();

      if (data) {
        this.loopEnabled.set(data.loopEnabled ?? false);
        this.loopTimestamp.set(data.loopTimestamp);
        this.volume.set(data.volume ?? 1);
        this.markers.set([...(data.markers ?? [])]);
        this.notes.set(data.notes ?? '');

        // Set duration from file metadata if available
        if (data.fileMetadata?.duration) {
          this.duration.set(data.fileMetadata.duration);
        }

        // Resolve audio URL
        if (data.audioFilePath) {
          this.resolveUrl(ent, data);
        } else {
          this.audioSrc.set(undefined);
        }
      }
    });
  }

  private async resolveUrl(entity: Entity, audioData: AudioData): Promise<void> {
    if (!this.pathResolver) {
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

  setLoopFromCurrent(): void {
    this.loopTimestamp.set(this.currentPlayerTime());
  }

  addMarker(): void {
    const newMarker = this.audioService.createMarker(
      `Marker ${this.markers().length + 1}`,
      this.currentPlayerTime()
    );
    this.markers.update((m) => [...m, newMarker]);
  }

  updateMarkerName(index: number, name: string): void {
    this.markers.update((markers) =>
      markers.map((m, i) => (i === index ? { ...m, name } : m))
    );
  }

  updateMarkerTime(index: number, startTime: number): void {
    this.markers.update((markers) =>
      markers.map((m, i) => (i === index ? { ...m, startTime } : m))
    );
  }

  removeMarker(index: number): void {
    this.markers.update((markers) => markers.filter((_, i) => i !== index));
  }

  handleSave(): void {
    const currentData = this.audioData();
    if (!currentData) return;

    const updatedData: AudioData = {
      ...currentData,
      loopEnabled: this.loopEnabled(),
      loopTimestamp: this.loopEnabled() ? this.loopTimestamp() : undefined,
      volume: this.volume(),
      markers: this.audioService.sortMarkers(this.markers()),
      notes: this.notes() || undefined,
    };

    const serialized = this.audioService.serializeToEntity(updatedData);
    this.save()({ content: serialized });
  }

  handleCancel(): void {
    this.cancel()();
  }

  // Type helpers for event handling
  protected asInput(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }

  protected asCheckbox(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }

  protected asTextarea(event: Event): HTMLTextAreaElement {
    return event.target as HTMLTextAreaElement;
  }
}
