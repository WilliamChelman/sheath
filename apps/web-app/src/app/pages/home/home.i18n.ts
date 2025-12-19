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
  } as const,
  locales: {
    en: {
      hero: {
        badge: 'Draw Steel Companion',
        title: 'Sheath',
        subtitle: 'A companion app for Draw Steel, the tactical TTRPG from MCDM.',
        cta: {
          explore: 'Explore Tools',
          learn: 'Learn more',
        },
      },
    },
  },
});

export type HomeI18nKey = keyof typeof homeBundle.schema;
