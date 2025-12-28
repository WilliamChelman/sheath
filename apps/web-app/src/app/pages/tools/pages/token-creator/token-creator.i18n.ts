import { defineI18nBundle } from '@/i18n';

/**
 * Token Creator View i18n bundle.
 *
 * Covers the main view header, preview, and tips sections.
 * Component-specific translations are in their own bundles.
 */
export const tokenCreatorBundle = defineI18nBundle({
  namespace: 'tokenCreator',
  schema: {
    header: {
      badge: { message: '' },
      title: { message: '' },
      subtitle: { message: '' },
      helpTitle: { message: '' },
    },
    preview: {
      livePreview: { message: '' },
      sizeIndicator: {
        message: '',
        params: {} as { sizeLabel: string; sizePx: number },
      },
    },
    tips: {
      title: { message: '' },
      items: {
        png: { message: '' },
        svg: { message: '' },
        webp: { message: '' },
        resolution: { message: '' },
        inspiration: { message: '' },
      },
    },
  } as const,
  locales: {
    en: {
      header: {
        badge: 'Token Creator',
        title: 'Token Creator',
        subtitle:
          'Design custom tokens for your TTRPG sessions. Customize colors, size, and text, then export in your preferred format.',
        helpTitle: 'Take a tour of the Token Creator',
      },
      preview: {
        livePreview: 'Live Preview',
        sizeIndicator: '{sizeLabel} • {sizePx}px',
      },
      tips: {
        title: 'Tips',
        items: {
          png: 'Use PNG for tokens with transparency',
          svg: 'Use SVG for infinite scalability',
          webp: 'Use WebP for smaller file sizes with good quality',
          resolution:
            'Tokens export at 2x resolution for crisp display on high-DPI screens',
          inspiration:
            'A good use case is to load an existing token, for examples one from Max_HammGet, remove the border and the initials, set the token name, and maybe add the minion icon.',
        },
      },
    },
  },
});
