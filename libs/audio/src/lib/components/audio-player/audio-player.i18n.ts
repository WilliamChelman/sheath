import { defineI18nBundle } from '@/i18n';

export const audioPlayerBundle = defineI18nBundle({
  namespace: 'audioPlayer',
  schema: {
    play: { message: '' },
    pause: { message: '' },
    stop: { message: '' },
    mute: { message: '' },
    unmute: { message: '' },
    loop: { message: '' },
    volume: { message: '' },
    seekTo: { message: '', params: {} as { time: string } },
  } as const,
  locales: {
    en: {
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      mute: 'Mute',
      unmute: 'Unmute',
      loop: 'Loop',
      volume: 'Volume',
      seekTo: 'Seek to {time}',
    },
  },
});
