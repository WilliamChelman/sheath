import { defineI18nBundle } from '@/i18n';

export const toolsBundle = defineI18nBundle({
  namespace: 'tools',
  schema: {
    header: {
      badge: { message: '' },
      title: { message: '' },
      subtitle: { message: '' },
    },
    sections: {
      available: {
        badge: { message: '' },
        title: { message: '' },
      },
      comingSoon: {
        badge: { message: '' },
        title: { message: '' },
        placeholder: { message: '' },
      },
    },
    tools: {
      tokenCreator: {
        title: { message: '' },
        description: { message: '' },
      },
      compendium: {
        title: { message: '' },
        description: { message: '' },
      },
    },
    // ICU plural example
    toolCount: {
      message: '',
      params: {} as { count: number },
    },
  } as const,
  locales: {
    en: {
      header: {
        badge: 'Draw Steel Tools',
        title: 'Tools',
        subtitle: 'Helpful utilities for running Draw Steel sessions.',
      },
      sections: {
        available: {
          badge: 'Available',
          title: 'Core Tools',
        },
        comingSoon: {
          badge: 'Ideas',
          title: 'Ideas for the Future',
          placeholder: 'To be determined...',
        },
      },
      tools: {
        tokenCreator: {
          title: 'Token Creator',
          description:
            'Create custom monster tokens with configurable colors, size, and text.',
        },
        compendium: {
          title: 'Compendium',
          description:
            'Quick lookup for conditions, abilities, and core rules.',
        },
      },
      toolCount:
        '{count, plural, =0 {No tools} one {# tool} other {# tools}} available',
    },
  },
});
