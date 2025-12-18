import { defineI18nBundle } from '@/i18n';

/**
 * Home view i18n bundle.
 *
 * This bundle defines all translations for the home page.
 * The schema provides type-safety for keys and params.
 */
export const homeBundle = defineI18nBundle({
  namespace: 'home',
  schema: {
    hero: {
      badge: { message: '' },
      title: { message: '' },
      subtitle: { message: '' },
      cta: {
        explore: { message: '' },
        learn: { message: '' },
      },
    },
    features: {
      title: { message: '' },
      subtitle: { message: '' },
      heroManagement: {
        title: { message: '' },
        description: { message: '' },
      },
      combatTracker: {
        title: { message: '' },
        description: { message: '' },
      },
      quickReference: {
        title: { message: '' },
        description: { message: '' },
      },
    },
    drawSteel: {
      title: { message: '' },
      description1: { message: '' },
      description2: { message: '' },
    },
    cta: {
      title: { message: '' },
      subtitle: { message: '' },
      getStarted: { message: '' },
      visitMcdm: { message: '' },
    },
  } as const,
  locales: {
    en: {
      hero: {
        badge: 'Draw Steel Companion',
        title: 'Sheath',
        subtitle:
          'Your ultimate companion app for Draw Steel. Manage heroes, track combat, and master the tactical TTRPG from MCDM.',
        cta: {
          explore: 'Explore Tools',
          learn: 'Learn more',
        },
      },
      features: {
        title: 'Ready for Battle',
        subtitle: 'Everything you need to run smooth, epic Draw Steel sessions',
        heroManagement: {
          title: 'Hero Management',
          description:
            'Create and manage your Draw Steel heroes. Track abilities, equipment, and progression all in one place.',
        },
        combatTracker: {
          title: 'Combat Tracker',
          description:
            "Streamlined initiative and turn tracking designed for Draw Steel's unique combat system.",
        },
        quickReference: {
          title: 'Quick Reference',
          description:
            'Instant access to rules, conditions, and abilities. Spend less time flipping pages, more time playing.',
        },
      },
      drawSteel: {
        title: 'What is Draw Steel?',
        description1:
          'Draw Steel is a tactical fantasy TTRPG by MCDM Productions, designed for cinematic, heroic combat and rich storytelling. With its unique initiative system, signature abilities, and focus on teamwork, Draw Steel delivers fast-paced, strategic battles.',
        description2:
          "Sheath is here to help you focus on the adventure—not the bookkeeping. Whether you're a Director running epic encounters or a player mastering your hero, we've got the tools to keep your game flowing.",
      },
      cta: {
        title: 'Ready to Draw Steel?',
        subtitle:
          'Prepare your heroes, plan your encounters, and bring your Draw Steel sessions to life.',
        getStarted: 'Get Started',
        visitMcdm: 'Visit MCDM',
      },
    },
  },
});

export type HomeI18nKey = keyof typeof homeBundle.schema;
