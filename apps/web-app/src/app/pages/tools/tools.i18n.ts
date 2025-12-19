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
        title: 'Your Arsenal',
        subtitle:
          "Everything you need to run epic Draw Steel sessions. From character management to combat tracking—we've got you covered.",
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
            'Create custom monster tokens for your TTRPG sessions. Customize colors, size, text, and export in multiple formats.',
        },
        compendium: {
          title: 'Compendium',
          description:
            'Quick lookup for conditions, abilities, and core rules. Find what you need without flipping through the book.',
        },
        encounterBuilder: {
          title: 'Encounter Builder',
          description:
            'Design balanced encounters using threat budgets. Drag and drop monsters and set up battlefields.',
        },
        otherTools: {
          title: 'Other Tools',
          description:
            'Other tools might come up in the future depending on feedback and needs (dice rolls, hero builder, ...).',
        },
      },
      toolCount:
        '{count, plural, =0 {No tools} one {# tool} other {# tools}} available',
    },
  },
});
