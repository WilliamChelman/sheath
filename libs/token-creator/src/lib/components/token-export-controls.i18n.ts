import { defineI18nBundle } from '@/i18n';

/**
 * Token Export Controls i18n bundle.
 *
 * Covers export format selection and batch export.
 */
export const tokenExportControlsBundle = defineI18nBundle({
  namespace: 'tokenExportControls',
  schema: {
    title: { message: '' },
    format: { label: { message: '' } },
    download: {
      message: '',
      params: {} as { format: string },
    },
    batch: {
      exporting: { message: '' },
      exportButton: {
        message: '',
        params: {} as { count: number },
      },
    },
  } as const,
  locales: {
    en: {
      title: 'Export Token',
      format: { label: 'Format' },
      download: '📥 Download {format}',
      batch: {
        exporting: 'Exporting...',
        exportButton: '📦 Download {count} Tokens (ZIP)',
      },
    },
  },
});
