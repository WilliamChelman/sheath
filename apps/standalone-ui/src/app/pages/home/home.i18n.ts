import { defineI18nBundle } from '@/i18n';

export const homeBundle = defineI18nBundle({
  namespace: 'standalone-home',
  schema: {
    pageTitle: { message: '' },
    welcome: { message: '' },
    subtitle: { message: '' },
    quickActions: { message: '' },
    actions: {
      compendium: { message: '' },
      compendiumDesc: { message: '' },
      tokenCreator: { message: '' },
      tokenCreatorDesc: { message: '' },
      allTools: { message: '' },
      allToolsDesc: { message: '' },
    },
  } as const,
  locales: {
    en: {
      pageTitle: 'Home',
      welcome: 'Welcome to Sheath',
      subtitle: 'Your Draw Steel companion for managing campaigns, creating tokens, and more.',
      quickActions: 'Quick Actions',
      actions: {
        compendium: 'Browse Compendium',
        compendiumDesc: 'Search and explore Draw Steel rules, abilities, and monsters.',
        tokenCreator: 'Create Tokens',
        tokenCreatorDesc: 'Design custom tokens for your tabletop sessions.',
        allTools: 'View All Tools',
        allToolsDesc: 'Discover all available tools and utilities.',
      },
    },
  },
});
