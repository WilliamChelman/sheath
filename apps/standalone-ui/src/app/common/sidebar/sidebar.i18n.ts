import { defineI18nBundle } from '@/i18n';

export const sidebarBundle = defineI18nBundle({
  namespace: 'standalone-sidebar',
  schema: {
    brand: { message: '' },
    collapse: { message: '' },
    expand: { message: '' },
    links: {
      home: { message: '' },
      compendium: { message: '' },
      tokenCreator: { message: '' },
      allTools: { message: '' },
      about: { message: '' },
    },
  } as const,
  locales: {
    en: {
      brand: 'Sheath',
      collapse: 'Collapse sidebar',
      expand: 'Expand sidebar',
      links: {
        home: 'Home',
        compendium: 'Compendium',
        tokenCreator: 'Token Creator',
        allTools: 'All Tools',
        about: 'About',
      },
    },
  },
});
