import { defineI18nBundle } from '@/i18n';

/**
 * Navbar component i18n bundle.
 *
 * This bundle defines all translations for the navbar component.
 */
export const navbarBundle = defineI18nBundle({
  namespace: 'navbar',
  schema: {
    brand: { message: '' },
    links: {
      home: { message: '' },
      about: { message: '' },
      tools: { message: '' },
      tokenGenerator: { message: '' },
      compendium: { message: '' },
    },
    language: {
      label: { message: '' },
      en: { message: '' },
    },
  } as const,
  locales: {
    en: {
      brand: 'Sheath',
      links: {
        home: 'Home',
        about: 'About',
        tools: 'Tools',
        tokenGenerator: 'Token Generator',
        compendium: 'Compendium',
      },
      language: {
        label: 'Language',
        en: 'English',
      },
    },
  },
});
