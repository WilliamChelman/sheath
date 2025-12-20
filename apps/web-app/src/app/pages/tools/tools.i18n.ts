import { defineI18nBundle } from '@/i18n';

export const toolsBundle = defineI18nBundle({
  namespace: 'features',
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
      },
    },
    tools: {
      tokenGenerator: {
        title: { message: '' },
        description: { message: '' },
      },
      compendium: {
        title: { message: '' },
        description: { message: '' },
      },
      encounterBuilder: {
        title: { message: '' },
        description: { message: '' },
      },
      otherTools: {
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
        subtitle:
          'Helpful utilities for running Draw Steel sessions.',
      },
      sections: {
        available: {
          badge: 'Available',
          title: 'Core Tools',
        },
        comingSoon: {
          badge: 'Coming Soon',
          title: 'Future Tools',
        },
      },
      tools: {
        tokenGenerator: {
          title: 'Token Generator',
          description:
            'Create custom monster tokens with configurable colors, size, and text.',
        },
        compendium: {
          title: 'Compendium',
          description:
            'Quick lookup for conditions, abilities, and core rules.',
        },
        encounterBuilder: {
          title: 'Encounter Builder',
          description:
            'Design balanced encounters using threat budgets.',
        },
        otherTools: {
          title: 'More Tools',
          description:
            'Additional tools based on community feedback.',
        },
      },
      toolCount:
        '{count, plural, =0 {No tools} one {# tool} other {# tools}} available',
    },
  },
});
