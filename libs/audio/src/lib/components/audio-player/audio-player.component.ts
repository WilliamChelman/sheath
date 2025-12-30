import { I18nService } from '@/i18n';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPause,
  heroPlay,
  heroSpeakerWave,
  heroSpeakerXMark,
} from '@ng-icons/heroicons/outline';
import { phosphorArrowsClockwise } from '@ng-icons/phosphor-icons/regular';
import { AudioMarker } from '../../models/audio.model';
import { AudioService } from '../../services/audio.service';
import { audioPlayerBundle } from './audio-player.i18n';

@Component({
  selector: 'lib-audio-player',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      heroPlay,
      heroPause,
      heroSpeakerWave,
      heroSpeakerXMark,
      phosphorArrowsClockwise,
    }),
  ],
  template: `
    <div class="audio-player card bg-base-200 p-3">
      <!-- Hidden audio element -->
      <audio
        #audioElement
        [src]="src()"
        (loadedmetadata)="onLoadedMetadata()"
        (timeupdate)="onTimeUpdate()"
        (ended)="onEnded()"
        (error)="onError($event)"
      ></audio>

      <!-- Progress bar -->
      <div
        class="relative h-2 bg-base-300 rounded cursor-pointer mb-3"
        (click)="onProgressClick($event)"
      >
        <!-- Loop marker -->
        @if (loopTimestamp() !== undefined && duration() > 0) {
          <div
            class="absolute top-0 bottom-0 w-0.5 bg-warning z-10"
            [style.left.%]="loopPosition()"
            title="Loop point"
          ></div>
        }

        <!-- Progress fill -->
        <div
          class="absolute top-0 bottom-0 left-0 bg-primary rounded"
          [style.width.%]="progress()"
        ></div>

        <!-- Markers -->
        @for (marker of markers(); track marker.id) {
          <div
            class="absolute top-0 bottom-0 w-1 bg-secondary z-10 cursor-pointer hover:bg-secondary-focus"
            [style.left.%]="getMarkerPosition(marker)"
            [title]="marker.name"
            (click)="seekTo(marker.startTime); $event.stopPropagation()"
          ></div>
        }
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2">
        <!-- Play/Pause -->
        <button
          class="btn btn-circle btn-sm btn-ghost"
          (click)="togglePlay()"
          [title]="isPlaying() ? t('pause') : t('play')"
        >
          <ng-icon
            [name]="isPlaying() ? 'heroPause' : 'heroPlay'"
            class="text-lg"
          />
        </button>

        <!-- Time display -->
        <span class="text-sm font-mono min-w-[5rem] text-center">
          {{ formattedCurrentTime() }} / {{ formattedDuration() }}
        </span>

        <div class="flex-1"></div>

        <!-- Loop toggle -->
        <button
          class="btn btn-circle btn-sm btn-ghost"
          [class.text-primary]="loopEnabled()"
          (click)="toggleLoop()"
          [title]="t('loop')"
        >
          <ng-icon name="phosphorArrowsClockwise" class="text-lg" />
        </button>

        <!-- Volume -->
        <button
          class="btn btn-circle btn-sm btn-ghost"
          (click)="toggleMute()"
          [title]="isMuted() ? t('unmute') : t('mute')"
        >
          <ng-icon
            [name]="isMuted() ? 'heroSpeakerXMark' : 'heroSpeakerWave'"
            class="text-lg"
          />
        </button>

        <input
          type="range"
          class="range range-xs w-20"
          min="0"
          max="1"
          step="0.01"
          [value]="volume()"
          (input)="onVolumeChange($event)"
          [title]="t('volume')"
        />
      </div>

      <!-- Markers list -->
      @if (markers().length > 0) {
        <div class="flex gap-1 mt-2 flex-wrap">
          @for (marker of markers(); track marker.id) {
            <button
              class="btn btn-xs"
              (click)="seekTo(marker.startTime)"
              [title]="t('seekTo', { time: audioService.formatTime(marker.startTime) })"
            >
              {{ marker.name }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class AudioPlayerComponent implements OnDestroy {
  protected readonly audioService = inject(AudioService);
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.useBundleT(audioPlayerBundle);

  // Inputs
  src = input.required<string>();
  loopTimestamp = input<number>();
  loopEnabled = input(false);
  initialVolume = input(1);
  markers = input<AudioMarker[]>([]);

  // Outputs
  timeUpdate = output<number>();
  ended = output<void>();

  // Audio element reference
  private readonly audioRef =
    viewChild<ElementRef<HTMLAudioElement>>('audioElement');

  // State
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  hasError = signal(false);

  // Computed
  progress = computed(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0
  );

  loopPosition = computed(() => {
    const loop = this.loopTimestamp();
    const dur = this.duration();
    if (loop === undefined || dur <= 0) return 0;
    return (loop / dur) * 100;
  });

  formattedCurrentTime = computed(() =>
    this.audioService.formatTime(this.currentTime())
  );

  formattedDuration = computed(() =>
    this.audioService.formatTime(this.duration())
  );

  constructor() {
    // Sync volume with input
    effect(() => {
      this.volume.set(this.initialVolume());
      const audio = this.audioRef()?.nativeElement;
      if (audio) {
        audio.volume = this.initialVolume();
      }
    });

    // Handle custom loop logic
    effect(() => {
      const audio = this.audioRef()?.nativeElement;
      if (!audio) return;

      const loopTs = this.loopTimestamp();
      const loopOn = this.loopEnabled();

      // If loop is enabled but we have a custom loop point, disable native loop
      audio.loop = loopOn && loopTs === undefined;
    });
  }

  ngOnDestroy(): void {
    const audio = this.audioRef()?.nativeElement;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
  }

  onLoadedMetadata(): void {
    const audio = this.audioRef()?.nativeElement;
    if (audio) {
      this.duration.set(audio.duration);
      this.hasError.set(false);
    }
  }

  onTimeUpdate(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) return;

    this.currentTime.set(audio.currentTime);
    this.timeUpdate.emit(audio.currentTime);

    // Custom loop handling
    const loopTs = this.loopTimestamp();
    if (
      this.loopEnabled() &&
      loopTs !== undefined &&
      audio.currentTime >= audio.duration - 0.05
    ) {
      audio.currentTime = loopTs;
    }
  }

  onEnded(): void {
    this.isPlaying.set(false);

    // If we have custom loop with timestamp, it should have been handled in onTimeUpdate
    if (!this.loopEnabled()) {
      this.ended.emit();
    }
  }

  onError(event: Event): void {
    console.error('Audio error:', event);
    this.hasError.set(true);
    this.isPlaying.set(false);
  }

  togglePlay(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) return;

    if (this.isPlaying()) {
      audio.pause();
      this.isPlaying.set(false);
    } else {
      audio.play().then(() => {
        this.isPlaying.set(true);
      });
    }
  }

  toggleLoop(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) return;

    // Toggle: if we have a loop timestamp, this just toggles the enabled state
    // The actual loop behavior is handled in onTimeUpdate
    const newLoopState = !this.loopEnabled();

    // If no custom loop timestamp, use native loop
    if (this.loopTimestamp() === undefined) {
      audio.loop = newLoopState;
    }
  }

  toggleMute(): void {
    const audio = this.audioRef()?.nativeElement;
    if (!audio) return;

    audio.muted = !audio.muted;
    this.isMuted.set(audio.muted);
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    this.volume.set(value);

    const audio = this.audioRef()?.nativeElement;
    if (audio) {
      audio.volume = value;
      if (value > 0 && this.isMuted()) {
        audio.muted = false;
        this.isMuted.set(false);
      }
    }
  }

  onProgressClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * this.duration();
    this.seekTo(time);
  }

  seekTo(time: number): void {
    const audio = this.audioRef()?.nativeElement;
    if (audio && isFinite(time)) {
      audio.currentTime = Math.max(0, Math.min(time, this.duration()));
    }
  }

  getMarkerPosition(marker: AudioMarker): number {
    const dur = this.duration();
    if (dur <= 0) return 0;
    return (marker.startTime / dur) * 100;
  }
}
