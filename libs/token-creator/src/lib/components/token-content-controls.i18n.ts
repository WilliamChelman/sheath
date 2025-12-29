import { defineI18nBundle } from '@/i18n';

/**
 * Token Content Controls i18n bundle.
 *
 * Covers name, initials, toggles, and position options.
 */
export const tokenContentControlsBundle = defineI18nBundle({
  namespace: 'tokenContentControls',
  schema: {
    title: { message: '' },
    reset: {
      label: { message: '' },
      title: { message: '' },
    },
    name: {
      label: { message: '' },
      placeholder: { message: '' },
      hint: { message: '' },
      batchHint: { message: '' },
    },
    initials: {
      label: { message: '' },
      helperText: { message: '' },
      batchHelperText: { message: '' },
      placeholder: { message: '' },
    },
    toggles: {
      showInitials: { message: '' },
      showName: { message: '' },
      showMinionIcon: { message: '' },
    },
    namePosition: { label: { message: '' } },
    minionIconPosition: { label: { message: '' } },
    options: {
      namePositions: {
        top: { message: '' },
        bottom: { message: '' },
        bottomFlat: { message: '' },
      },
      minionIconPositions: {
        topLeft: { message: '' },
        topRight: { message: '' },
        bottomLeft: { message: '' },
        bottomRight: { message: '' },
      },
    },
  } as const,
  locales: {
    en: {
      title: 'Token Configuration',
      reset: {
        label: '↺ Reset',
        title: 'Reset all options to defaults',
      },
      name: {
        label: 'Token Name',
        placeholder: 'Goblin or Goblin, Orc@OR, Dragon!',
        hint: 'Tip: Use commas or new lines to create multiple tokens at once',
        batchHint:
          'Batch mode: Use @XX for custom initials, ! for minions (e.g. Orc@OR!)',
      },
      initials: {
        label: 'Initials',
        helperText: 'Auto-generated from name',
        batchHelperText: 'Auto-generated, or use @XX suffix per token',
        placeholder: 'GB',
      },
      toggles: {
        showInitials: 'Show initials',
        showName: 'Show name on token',
        showMinionIcon: 'Show minion icon',
      },
      namePosition: { label: 'Name Position' },
      minionIconPosition: { label: 'Icon Position' },
      options: {
        namePositions: {
          top: 'Top',
          bottom: 'Bottom',
          bottomFlat: 'Bottom Flat',
        },
        minionIconPositions: {
          topLeft: '↖',
          topRight: '↗',
          bottomLeft: '↙',
          bottomRight: '↘',
        },
      },
    },
  },
});
