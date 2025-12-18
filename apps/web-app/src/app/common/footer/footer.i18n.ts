import { defineI18nBundle } from '@/i18n';

/**
 * Footer component i18n bundle.
 */
export const footerBundle = defineI18nBundle({
  namespace: 'footer',
  schema: {
    appName: { message: '' },
    links: {
      about: { message: '' },
      tools: { message: '' },
      mcdm: { message: '' },
    },
    legal: {
      prefix: {
        message: '',
        params: {} as { year: number; appName: string },
      },
      mcdmProductions: { message: '' },
      suffix: { message: '' },
    },
  } as const,
  locales: {
    en: {
      appName: 'Sheath',
      links: {
        about: 'About',
        tools: 'Tools',
        mcdm: 'MCDM',
      },
      legal: {
        prefix:
          '© {year} {appName} — A Draw Steel companion app. Not affiliated with ',
        mcdmProductions: 'MCDM Productions',
        suffix: '.',
      },
    },
  },
});
