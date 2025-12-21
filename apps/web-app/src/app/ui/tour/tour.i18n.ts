import { defineI18nBundle } from '@/i18n';

/**
 * Common i18n bundle for tour UI elements.
 *
 * Contains translations for navigation buttons and labels used across all tours.
 */
export const tourBundle = defineI18nBundle({
  namespace: 'tour',
  schema: {
    close: { message: '' },
    next: { message: '' },
    previous: { message: '' },
    finish: { message: '' },
    stepIndicator: {
      message: '',
      params: {} as { current: number; total: number },
    },
  } as const,
  locales: {
    en: {
      close: 'Close tour',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      stepIndicator: '{current} / {total}',
    },
  },
});
