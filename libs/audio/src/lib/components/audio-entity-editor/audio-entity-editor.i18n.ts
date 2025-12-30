import { defineI18nBundle } from '@/i18n';

export const audioEntityEditorBundle = defineI18nBundle({
  namespace: 'audioEntityEditor',
  schema: {
    editAudio: { message: '' },
    playbackSettings: { message: '' },
    enableLoop: { message: '' },
    loopTimestamp: { message: '' },
    loopTimestampHelp: { message: '' },
    setFromCurrent: { message: '' },
    defaultVolume: { message: '' },
    markers: { message: '' },
    addMarker: { message: '' },
    markerName: { message: '' },
    markerTime: { message: '' },
    notes: { message: '' },
    notesPlaceholder: { message: '' },
    save: { message: '' },
    cancel: { message: '' },
  } as const,
  locales: {
    en: {
      editAudio: 'Edit Audio',
      playbackSettings: 'Playback Settings',
      enableLoop: 'Enable Loop',
      loopTimestamp: 'Loop Timestamp',
      loopTimestampHelp:
        'When looping, playback will restart from this point instead of the beginning',
      setFromCurrent: 'Set from current',
      defaultVolume: 'Default Volume',
      markers: 'Markers',
      addMarker: 'Add Marker',
      markerName: 'Marker Name',
      markerTime: 'Time (seconds)',
      notes: 'Notes',
      notesPlaceholder: 'Add notes about this audio...',
      save: 'Save',
      cancel: 'Cancel',
    },
  },
});
