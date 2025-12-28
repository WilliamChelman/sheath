import { defineI18nBundle } from '@/i18n';

/**
 * Markdown Editor i18n bundle.
 *
 * Covers editor modes, toolbar, and preview.
 */
export const markdownEditorBundle = defineI18nBundle({
  namespace: 'markdownEditor',
  schema: {
    // Editor modes
    livePreview: { message: '' },
    splitView: { message: '' },
    toggleToc: { message: '' },
    placeholder: { message: '' },
    noHeadings: { message: '' },
    previewPlaceholder: { message: '' },
    // Floating toolbar
    toolbar: {
      bold: { message: '' },
      italic: { message: '' },
      heading: { message: '' },
      link: { message: '' },
      code: { message: '' },
      quote: { message: '' },
    },
  } as const,
  locales: {
    en: {
      // Editor modes
      livePreview: 'Live Preview',
      splitView: 'Split View',
      toggleToc: 'Toggle Table of Contents',
      placeholder: 'Start writing...',
      noHeadings: 'Add headings to see outline...',
      previewPlaceholder: 'Preview will appear here...',
      // Floating toolbar
      toolbar: {
        bold: 'Bold (Ctrl+B)',
        italic: 'Italic (Ctrl+I)',
        heading: 'Heading',
        link: 'Link (Ctrl+K)',
        code: 'Code (Ctrl+`)',
        quote: 'Quote (Ctrl+Shift+.)',
      },
    },
  },
});
