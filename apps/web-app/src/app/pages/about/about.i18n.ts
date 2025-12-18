import { defineI18nBundle } from '@/i18n';

/**
 * About view i18n bundle.
 */
export const aboutBundle = defineI18nBundle({
  namespace: 'about',
  schema: {
    legal: { message: '' },
  } as const,
  locales: {
    en: {
      legal:
        'Sheath is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL © 2024 MCDM Productions, LLC.',
    },
  },
});
