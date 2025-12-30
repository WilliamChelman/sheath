import { defineI18nBundle } from '@/i18n';

export const audioEntityViewerBundle = defineI18nBundle({
  namespace: 'audioEntityViewer',
  schema: {
    noAudioFile: { message: '' },
    duration: { message: '' },
    format: { message: '' },
    bitrate: { message: '' },
    sampleRate: { message: '' },
    channels: { message: '' },
    mono: { message: '' },
    stereo: { message: '' },
    artist: { message: '' },
    album: { message: '' },
    year: { message: '' },
    genre: { message: '' },
  } as const,
  locales: {
    en: {
      noAudioFile: 'No audio file associated',
      duration: 'Duration',
      format: 'Format',
      bitrate: 'Bitrate',
      sampleRate: 'Sample Rate',
      channels: 'Channels',
      mono: 'Mono',
      stereo: 'Stereo',
      artist: 'Artist',
      album: 'Album',
      year: 'Year',
      genre: 'Genre',
    },
  },
});
