import { defineI18nBundle } from '@/i18n';

/**
 * Token Background Controls i18n bundle.
 *
 * Covers background image upload, opacity, and actions.
 */
export const tokenBackgroundControlsBundle = defineI18nBundle({
  namespace: 'tokenBackgroundControls',
  schema: {
    title: { message: '' },
    upload: { label: { message: '' } },
    opacity: { label: { message: '' } },
    actions: {
      reset: { message: '' },
      resetTitle: { message: '' },
      remove: { message: '' },
      removeTitle: { message: '' },
    },
    hint: { message: '' },
  } as const,
  locales: {
    en: {
      title: 'Background Image',
      upload: { label: 'Upload Image' },
      opacity: { label: 'Opacity' },
      actions: {
        reset: '🔄 Reset View',
        resetTitle: 'Reset pan and zoom',
        remove: '🗑️ Remove',
        removeTitle: 'Remove background image',
      },
      hint: 'Drag the preview to reposition. Scroll to zoom in/out.',
    },
  },
});
