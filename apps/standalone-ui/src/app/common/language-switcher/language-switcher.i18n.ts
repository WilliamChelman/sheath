import { defineI18nBundle } from '@/i18n';

export const languageSwitcherBundle = defineI18nBundle({
  namespace: 'standalone-languageSwitcher',
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
