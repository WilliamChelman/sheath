import { defineI18nBundle } from '@/i18n';

/**
 * Features view i18n bundle.
 *
 * This bundle demonstrates ICU message format with plurals.
 */
export const featuresBundle = defineI18nBundle({
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
      heroBuilder: {
        title: { message: '' },
        description: { message: '' },
      },
      rulesReference: {
        title: { message: '' },
        description: { message: '' },
      },
      combatTracker: {
        title: { message: '' },
        description: { message: '' },
      },
      npcManager: {
        title: { message: '' },
        description: { message: '' },
      },
      encounterBuilder: {
        title: { message: '' },
        description: { message: '' },
      },
      diceRoller: {
        title: { message: '' },
        description: { message: '' },
      },
      sessionNotes: {
        title: { message: '' },
        description: { message: '' },
      },
      partyDashboard: {
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
        heroBuilder: {
          title: 'Hero Builder',
          description:
            'Create and customize your Draw Steel heroes. Select ancestry, class, and abilities with guided character creation.',
        },
        rulesReference: {
          title: 'Rules Reference',
          description:
            'Quick lookup for conditions, abilities, and core rules. Find what you need without flipping through the book.',
        },
        combatTracker: {
          title: 'Combat Tracker',
          description:
            "Manage initiative with Draw Steel's unique turn-trading system. Track stamina, conditions, and villain actions.",
        },
        npcManager: {
          title: 'NPC & Monster Manager',
          description:
            'Build encounters and manage adversaries. Quick stat blocks and ability references for Directors.',
        },
        encounterBuilder: {
          title: 'Encounter Builder',
          description:
            'Design balanced encounters using threat budgets. Drag and drop monsters and set up battlefields.',
        },
        diceRoller: {
          title: 'Dice Roller',
          description:
            'Built-in dice roller with Draw Steel mechanics. Power roll calculations and result interpretation.',
        },
        sessionNotes: {
          title: 'Session Notes',
          description:
            'Keep track of your campaign with integrated notes, NPC tracking, and story progression.',
        },
        partyDashboard: {
          title: 'Party Dashboard',
          description:
            'Overview of your entire party. Track resources, conditions, and coordinate tactics.',
        },
      },
      toolCount:
        '{count, plural, =0 {No tools} one {# tool} other {# tools}} available',
    },
  },
});
