import { defineI18nBundle } from '@/i18n';

export const pwaUpdateToastBundle = defineI18nBundle({
  namespace: 'pwa-update-toast',
  schema: {
    message: { message: '' },
    reloadButton: { message: '' },
  } as const,
  locales: {
    en: {
      message: 'A new version is available.',
      reloadButton: 'Reload',
    },
  },
});
