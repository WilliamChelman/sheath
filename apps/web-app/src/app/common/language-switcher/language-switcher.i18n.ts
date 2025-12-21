import { defineI18nBundle } from '@/i18n';

/**
 * Language switcher component i18n bundle.
 */
export const languageSwitcherBundle = defineI18nBundle({
  namespace: 'languageSwitcher',
  schema: {
    label: { message: '' },
    en: { message: '' },
  } as const,
  locales: {
    en: {
      label: 'Language',
      en: 'English',
    },
  },
});
