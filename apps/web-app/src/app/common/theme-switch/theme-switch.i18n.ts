import { defineI18nBundle } from '@/i18n';

export const themeSwitchBundle = defineI18nBundle({
  namespace: 'theme-switch',
  schema: {
    theme: { message: '' },
    toggleTheme: { message: '' },
  } as const,
  locales: {
    en: {
      theme: 'Theme',
      toggleTheme: 'Toggle theme',
    },
  },
});
