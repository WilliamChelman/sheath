import { EntityClassConfig, EntityClassPropertyConfig } from '@/entity';

export const AUDIO_TYPE_ID = 'sheath.core.audio';

export const audioClassConfig: EntityClassConfig = {
  id: AUDIO_TYPE_ID,
  name: 'Audio',
  properties: [
    'sheath.core.audio.loopTimestamp',
    'sheath.core.audio.loopEnabled',
    'sheath.core.audio.volume',
  ],
};

export const audioPropertyConfigs: EntityClassPropertyConfig[] = [
  {
    id: 'sheath.core.audio.loopTimestamp',
    name: 'Loop Timestamp',
    datatype: 'number',
    description: 'Time in seconds where audio restarts when looping',
  },
  {
    id: 'sheath.core.audio.loopEnabled',
    name: 'Loop Enabled',
    datatype: 'boolean',
    default: false,
  },
  {
    id: 'sheath.core.audio.volume',
    name: 'Default Volume',
    datatype: 'number',
    default: 1,
  },
];
