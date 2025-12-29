import { defineI18nBundle } from '@/i18n';

export const folderSettingsBundle = defineI18nBundle({
  namespace: 'standalone-folder-settings',
  schema: {
    changeFolder: { message: '' },
    currentFolder: { message: '' },
  } as const,
  locales: {
    en: {
      changeFolder: 'Change folder',
      currentFolder: 'Current folder',
    },
  },
});
